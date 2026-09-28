import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, File, ChevronRight, ChevronDown, CheckCircle, AlertTriangle,
  Play, RotateCcw, Search, Layers, PlayCircle, Bug, Settings, 
  CheckSquare, FileText, Plus, Upload, Download, Trash, RefreshCw, Save, AlignLeft, FastForward, List,
  BookMarked, Copy, Check, Terminal, FilePlus, FolderPlus, PenLine
} from "lucide-react";

interface BlockchainIDEClientProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

const STORAGE_CODE = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {

    uint256 number;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}`;

const OWNER_CODE = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Owner
 * @dev Set & change owner
 */
contract Owner {

    address private owner;

    // event for EVM logging
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    // modifier to check if caller is owner
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner);
    }

    /**
     * @dev Change owner
     * @param newOwner address of new owner
     */
    function changeOwner(address newOwner) public isOwner {
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Return owner address 
     * @return address of owner
     */
    function getOwner() external view returns (address) {
        return owner;
    }
}`;

const BALLOT_CODE = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract Ballot {

    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
}`;

export default function BlockchainIDEClient({ onClose, showToast }: BlockchainIDEClientProps) {
  // Global / Layout state
  const [activeIdeTool, setActiveIdeTool] = useState("fileBrowser"); // fileBrowser, search, compile, deploy, unitTest, debugger, settings
  const [storageMode, setStorageMode] = useState("浏览器存储"); // '浏览器存储' or '本地存储'
  
  // Editor state
  const [activeContractFile, setActiveContractFile] = useState("1_Storage.sol");
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "1_Storage.sol": STORAGE_CODE,
    "2_Owner.sol": OWNER_CODE,
    "3_Ballot.sol": BALLOT_CODE
  });
  const contractCode = fileContents[activeContractFile] || "";
  const [contractSavedStatus, setContractSavedStatus] = useState(true);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  
  // Compile state
  const [compileStatus, setCompileStatus] = useState("未编译"); // "未编译", "编译中", "编译成功", "编译失败"
  const [staticAnalysisVisible, setStaticAnalysisVisible] = useState(false);
  
  // Deploy state
  const [deployEnvironment, setDeployEnvironment] = useState("JavaScript VM (London)");
  const [deployedContracts, setDeployedContracts] = useState<any[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [storeInputValue, setStoreInputValue] = useState("");
  const [retrieveResult, setRetrieveResult] = useState<string | null>(null);
  
  // Test state
  const [unitTestStatus, setUnitTestStatus] = useState("未运行");
  
  // Debug state
  const [debugStatus, setDebugStatus] = useState("未开始");
  const [currentDebugLine, setCurrentDebugLine] = useState(-1);
  const [debugVariables, setDebugVariables] = useState({ num: "100", number: "0" });
  
  // Console
  const [consoleLogs, setConsoleLogs] = useState<{type: string, msg: string, time: string}[]>([
    { type: "info", msg: "remix\nType the library name to see available commands.", time: new Date().toLocaleTimeString() }
  ]);
  const [transactionRecords, setTransactionRecords] = useState<any[]>([]);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [deployedExpanded, setDeployedExpanded] = useState(true);

  const handleCopyAddress = (addr: string) => {
    showToast("合约地址已复制。");
    addLog("info", `Copied to clipboard: ${addr}`);
  };

  const handleRemoveContract = (index: number) => {
    setDeployedContracts(prev => prev.filter((_, i) => i !== index));
    addLog("info", "Contract instance removed");
  };

  // Expeirment automated runner
  const [experimentMode, setExperimentMode] = useState("未选择");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);

  const addLog = (type: string, msg: string) => {
    setConsoleLogs(prev => [...prev, { type, msg, time: new Date().toLocaleTimeString() }]);
  };

  const addTx = (type: string, contract: string, method: string, hash: string, block: number, gas: number, status: string) => {
    setTransactionRecords(prev => [...prev, { time: new Date().toLocaleTimeString(), type, contract, method, hash, block, gas, status }]);
    setTxCount(c => c + 1);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContents(prev => ({ ...prev, [activeContractFile]: e.target.value }));
    setContractSavedStatus(false);
  };

  const handleSave = () => {
    setContractSavedStatus(true);
    showToast(`${activeContractFile} 已保存。`);
  };

  const handleFormat = () => {
    showToast("代码格式化成功");
    addLog("success", "Code formatted");
  };

  const handleCopyABI = () => {
    showToast("ABI 代码已复制到剪贴板！");
    addLog("info", "ABI copied to clipboard");
  };

  const handleExportABI = () => {
    showToast("ABI 导出成功");
    addLog("success", "ABI file exported");
  };

  const handleGenerateTest = () => {
    showToast("test file generated");
    addLog("success", "test file generated");
  };

  const handleClearConsole = () => {
    setConsoleLogs([]);
  };

  const handleClearCompileResult = () => {
    setCompileStatus("未编译");
    setStaticAnalysisVisible(false);
  };

  const handleSwitchStorageMode = (mode: string) => {
    showToast(`已切换至${mode}`);
    addLog("info", `Storage mode switched to ${mode}`);
  };

  const handleOpenFile = (file: string) => {
    setActiveContractFile(file);
    addLog("info", `打开 ${file}`);
  };
  const toggleBreakpoint = (line: number) => {
    setBreakpoints(prev => {
      const isSet = prev.includes(line);
      return isSet ? prev.filter(l => l !== line) : [...prev, line];
    });
  };

  const handleCompile = () => {
    if (contractCode.includes("ParserError")) {
      setCompileStatus("编译失败");
      addLog("error", "ParserError: Expected ';' but got '}'");
      return;
    }
    setCompileStatus("编译中");
    addLog("info", "Compiling 1_Storage.sol...");
    
    setTimeout(() => {
      setCompileStatus("编译成功");
      setStaticAnalysisVisible(true);
      addLog("success", "Compilation successful");
      addLog("success", "ABI generated");
      addLog("success", "Bytecode generated");
    }, 1000);
  };

  const handleDeploy = () => {
    if (compileStatus !== "编译成功") {
      showToast("请先编译合约");
      return;
    }
    addLog("info", "Deploying Storage...");
    
    setTimeout(() => {
      const addr = "0xA1b2C3d4E5F60718293aBcD4567890Ef12345678";
      setDeployedContracts([{ name: "Storage", address: addr }]);
      addTx("部署", "Storage", "constructor", "0xdeploy_tx_0001", 15, 168432, "成功");
      addLog("success", `Contract deployed at ${addr}`);
      addLog("info", "Gas used: 168432");
    }, 1000);
  };

  const handleTransactStore = () => {
    if (!storeInputValue) return;
    
    if (breakpoints.includes(18)) {
      setDebugStatus("暂停在断点");
      setCurrentDebugLine(18);
      setDebugVariables({ num: storeInputValue, number: "0" });
      addLog("info", "Debugging transaction 0xcall_tx_0002");
      addLog("warning", "Paused at line 18");
      setActiveIdeTool("debugger");
      return;
    }

    addTx("调用", "Storage", "store", "0xcall_tx_0002", 16, 45120, "成功");
    addLog("info", `store(${storeInputValue}) transaction sent`);
    addLog("success", "Transaction mined");
  };

  const handleCallRetrieve = () => {
    setRetrieveResult("100");
    addTx("调用", "Storage", "retrieve", "view", 16, 0, "成功");
    addLog("info", "retrieve() returned 100");
  };

  const handleRunTest = () => {
    setUnitTestStatus("正在运行");
    addLog("info", "Running checkWinningProposal");
    setTimeout(() => {
      setUnitTestStatus("PASS");
      addLog("success", "Progress: 1 finished (of 1)");
    }, 800);
  };

  const handleStepOver = () => {
    setDebugVariables({ num: "100", number: "100" });
    addLog("info", "Step over executed");
    addLog("success", "number changed from 0 to 100");
  };

  const handleContinueRunning = () => {
    setDebugStatus("未开始");
    setCurrentDebugLine(-1);
    addTx("调用", "Storage", "store", "0xcall_tx_0002", 16, 45120, "成功");
    addLog("success", "Transaction mined");
  };

  const handleReset = () => {
    setCompileStatus("未编译");
    setDeployedContracts([]);
    setRetrieveResult(null);
    setStaticAnalysisVisible(false);
    setUnitTestStatus("未运行");
    setDebugStatus("未开始");
    setCurrentDebugLine(-1);
    setTxCount(0);
    setBreakpoints([]);
    setConsoleLogs([{ type: "info", msg: "remix\nType the library name to see available commands.", time: new Date().toLocaleTimeString() }]);
    setTransactionRecords([]);
    setExperimentMode("未选择");
    setCurrentStepIndex(0);
    setResetConfirmVisible(false);
    showToast("智能合约开发实验已重置，可重新开始练习。");
  };

  const steps = [
    () => { addLog("info", "打开 1_Storage.sol"); setCurrentStepIndex(1); },
    () => { handleSave(); setCurrentStepIndex(2); },
    () => { setActiveIdeTool("compile"); handleCompile(); setCurrentStepIndex(3); },
    () => { addLog("info", "查看静态分析结果"); setCurrentStepIndex(4); },
    () => { setActiveIdeTool("deploy"); setDeployEnvironment("JavaScript VM (London)"); setCurrentStepIndex(5); },
    () => { handleDeploy(); setCurrentStepIndex(6); },
    () => { setStoreInputValue("100"); setTimeout(handleTransactStore, 100); setCurrentStepIndex(7); },
    () => { handleCallRetrieve(); setCurrentStepIndex(8); },
    () => { setActiveIdeTool("unitTest"); handleRunTest(); setCurrentStepIndex(9); },
    () => { setActiveIdeTool("debugger"); toggleBreakpoint(18); setCurrentStepIndex(10); },
    () => { setStoreInputValue("100"); setTimeout(handleTransactStore, 100); setCurrentStepIndex(11); },
    () => { handleStepOver(); setTimeout(handleContinueRunning, 400); setCurrentStepIndex(12); showToast("实验已完成"); }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (experimentMode === "自动" && currentStepIndex < steps.length) {
      timer = setTimeout(() => {
        steps[currentStepIndex]();
      }, 800);
    } else if (experimentMode === "自动" && currentStepIndex >= steps.length) {
      setExperimentMode("未选择");
    }
    return () => clearTimeout(timer);
  }, [experimentMode, currentStepIndex]);

  const handleAutoExperiment = () => {
    handleReset();
    setTimeout(() => {
      setExperimentMode("自动");
    }, 300);
  };

  const handleSingleStep = () => {
    setExperimentMode("单步");
    if (currentStepIndex < steps.length) {
      steps[currentStepIndex]();
    }
  };

  // -------------------------------------------------------------
  // Rendering Helpers
  // -------------------------------------------------------------
  const renderSidebarIcon = (id: string, icon: any, label: string) => (
    <div 
      className={`w-12 h-12 flex items-center justify-center cursor-pointer relative ${activeIdeTool === id ? 'text-[#007ACC]' : 'text-[#858585] hover:text-white'}`}
      onClick={() => setActiveIdeTool(id)}
      title={label}
    >
      {activeIdeTool === id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007ACC]"></div>}
      {icon}
    </div>
  );

  const renderCompilePanel = () => (
    <div className="flex flex-col h-full bg-[#252526] text-xs text-[#cccccc]">
      <div className="p-4 flex items-center justify-between border-b border-[#333333]">
        <span className="font-bold">SOLIDITY COMPILER</span>
        <button onClick={handleClearCompileResult} className="text-[#858585] hover:text-white" title="清除编译结果"><RotateCcw className="w-3.5 h-3.5"/></button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto">
        <select className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none">
          <option>编译器版本 0.8.20+commit.a1b79de6</option>
        </select>
        <select className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none">
          <option>语言 Solidity</option>
        </select>
        <select className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none">
          <option>EVM 版本 London</option>
        </select>
        <div className="flex justify-between items-center bg-[#3C3C3C] px-2 py-1 rounded">
          <label className="flex items-center gap-2 select-none"><input type="checkbox" defaultChecked />启用优化</label>
          <input type="number" defaultValue="200" className="w-16 bg-[#1E1E1E] text-center rounded border border-[#555] px-1 py-0.5" />
        </div>
        <button 
          onClick={handleCompile}
          className="w-full py-2.5 bg-[#007ACC] hover:bg-[#005A9E] text-white font-bold rounded flex items-center justify-center gap-2"
        >
          {compileStatus === "编译中" ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Layers className="w-4 h-4"/>} 
          编译 1_Storage.sol
        </button>

        {compileStatus === "编译成功" && (
           <div className="p-3 bg-[#1E1E1E] border border-green-800 rounded mt-4">
             <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> 编译成功</div>
             <div className="flex justify-between mb-1"><span>合约名称</span><span className="text-white">Storage</span></div>
             <div className="flex justify-between mb-1">
               <span>ABI</span>
               <div className="flex gap-2">
                 <span onClick={handleCopyABI} className="text-blue-400 cursor-pointer hover:underline">Copy ABI</span>
                 <span onClick={handleExportABI} className="text-blue-400 cursor-pointer hover:underline">Export ABI</span>
               </div>
             </div>
             <div className="flex justify-between mb-2"><span>Bytecode</span><span className="text-blue-400 cursor-pointer hover:underline">已生成</span></div>
             <div className="border-t border-[#333333] pt-2 mt-2">
               <div className="text-[#858585] mb-1">Gas 预估:</div>
               <div className="flex justify-between font-mono pl-2 text-yellow-500 opacity-80"><span>store:</span> <span>45120</span></div>
               <div className="flex justify-between font-mono pl-2 text-yellow-500 opacity-80"><span>retrieve:</span> <span>23580</span></div>
             </div>
           </div>
        )}

        {compileStatus === "编译失败" && (
           <div className="p-3 bg-[#1E1E1E] border border-red-800 rounded mt-4">
             <div className="text-red-400 font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> 编译失败</div>
             <div className="mb-1 text-red-300">ParserError: Expected ';' but got '{"}"}'</div>
             <div className="text-[#858585]">1_Storage.sol:18:22</div>
           </div>
        )}

        {false && (
          <div className="mt-6 border-t border-[#333333] pt-4">
            <h4 className="font-bold text-white mb-3">静态分析</h4>
            <div className="space-y-2">
              {[
                { name: "编译器版本检查", level: "低", msg: "版本范围 >=0.7.0 <0.9.0", line: "第 3 行", pass: true },
                { name: "状态变量访问检查", level: "低", msg: "number 为状态变量", line: "第 11 行", pass: true },
                { name: "Gas 消耗检查", level: "中", msg: "store 会写入链上状态", line: "第 18 行", pass: false },
                { name: "重入风险检查", level: "低", msg: "未发现外部调用", line: "-", pass: true },
                { name: "整数溢出风险检查", level: "低", msg: "未发现高风险运算", line: "-", pass: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#1E1E1E] p-2 rounded flex flex-col gap-1 border border-[#333]">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-[#DCDCAA]">{item.name}</span>
                     <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.pass ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{item.pass ? "通过" : "提示"}</span>
                   </div>
                   <div className="flex justify-between text-[11px]">
                     <span className="text-[#858585]">{item.line}</span>
                     <span className="text-white opacity-80">{item.msg}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeployPanel = () => (
    <div className="flex flex-col h-full bg-[#252526] text-xs text-[#cccccc]">
      <div className="p-4 flex items-center justify-between border-b border-[#333333]">
        <span className="font-bold text-white">部署 & 执行交易</span>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto w-full">
        <label className="text-[11px] text-[#858585] block mb-1">环境</label>
        <select 
          value={deployEnvironment} 
          onChange={(e) => setDeployEnvironment(e.target.value)}
          className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none mb-3"
        >
          <option value="JavaScript VM (London)">JavaScript VM (London)</option>
          <option value="JavaScript VM (Berlin)">JavaScript VM (Berlin)</option>
          <option value="Injected Web3">Injected Web3</option>
          <option value="Web3 Provider">Web3 Provider</option>
          <option value="Hardhat Provider">Hardhat Provider</option>
        </select>
        
        {deployEnvironment === "Web3 Provider" && (
          <input type="text" className="w-full bg-[#1E1E1E] border border-[#555] rounded px-2 py-1 text-white mb-3" defaultValue="http://127.0.0.1:8545" />
        )}
        {deployEnvironment === "Injected Web3" && (
          <div className="text-emerald-400 bg-emerald-900/20 p-2 rounded mb-3 border border-emerald-900/50">Web3 状态：已注入</div>
        )}

        <label className="text-[11px] text-[#858585] block mb-1">账户</label>
        <select className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none font-mono">
          <option>0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 (100 ETH)</option>
        </select>

        <div className="flex gap-2">
          <div className="flex-1">
             <label className="text-[11px] text-[#858585] block mb-1">Gas Limit</label>
             <input type="text" className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white" defaultValue="3000000" />
          </div>
          <div className="flex-1">
             <label className="text-[11px] text-[#858585] block mb-1">Value</label>
             <div className="flex items-stretch focus-within:ring-1 ring-[#007ACC] rounded">
                <input type="text" className="w-full bg-[#3C3C3C] border-none px-2 py-1.5 text-white rounded-l outline-none" defaultValue="0" />
                <span className="bg-[#1E1E1E] text-[#858585] px-2 py-1.5 border-l border-[#252526] rounded-r">Wei</span>
             </div>
          </div>
        </div>

        <div className="border-t border-[#333333] pt-4 mt-4">
          <label className="text-[11px] text-[#858585] block mb-1">合约</label>
          <select className="w-full bg-[#3C3C3C] border-none rounded px-2 py-1.5 text-white outline-none mb-3 font-mono">
            <option>Storage - contracts/1_Storage.sol</option>
          </select>
          <button 
             onClick={handleDeploy}
             className="w-full py-2 bg-[#F5A623] hover:bg-[#D48F1B] text-black font-bold rounded flex items-center justify-center"
          >
            部署
          </button>
        </div>
        
        <div className="text-[11px] text-[#858585] mt-2 mb-4">
           已记录交易 {txCount}
        </div>

        <div className="border-t border-[#333333] pt-4">
          <div className="flex items-center justify-between mb-4">
             <h4 className="font-bold text-white flex items-center gap-1"><ChevronDown className="w-4 h-4"/> 交易记录 ({txCount})</h4>
          </div>
          <div className="space-y-2 mb-4">
             {transactionRecords.map((tx, idx) => (
                <div key={idx} className="bg-[#1E1E1E] border border-[#333333] rounded overflow-hidden">
                   <div 
                     onClick={() => setExpandedTx(expandedTx === idx ? null : idx)} 
                     className="p-2 flex items-center justify-between cursor-pointer hover:bg-[#2A2D2E]"
                   >
                     <div className="flex items-center gap-2">
                       <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                       <span className="text-white font-mono">{tx.contract}.{tx.method}</span>
                     </div>
                     <ChevronDown className={`w-4 h-4 text-[#858585] transition-transform ${expandedTx === idx ? 'rotate-180' : ''}`} />
                   </div>
                   {expandedTx === idx && (
                     <div className="p-3 bg-[#252526] border-t border-[#333] space-y-1 font-mono text-[10px] text-[#cccccc]">
                       <div className="flex justify-between"><span>status</span><span className="text-emerald-400">0x1 execution succeed</span></div>
                       <div className="flex justify-between"><span>hash</span><span className="text-[#DCDCAA] truncate max-w-[150px]">{tx.hash}</span></div>
                       <div className="flex justify-between"><span>from</span><span className="text-[#DCDCAA]">0x5B3...ddC4</span></div>
                       <div className="flex justify-between"><span>to</span><span className="text-[#DCDCAA] truncate max-w-[150px]">{tx.contract}.{tx.method}</span></div>
                       <div className="flex justify-between"><span>gas</span><span>{tx.gas} gas</span></div>
                       <div className="flex justify-between"><span>block</span><span>{tx.block}</span></div>
                     </div>
                   )}
                </div>
             ))}
          </div>

          <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white" onClick={() => setDeployedExpanded(!deployedExpanded)}>
            <h4 className="font-bold text-white flex items-center gap-1"><ChevronDown className={`w-4 h-4 transition-transform ${!deployedExpanded ? '-rotate-90' : ''}`}/> 已部署合约</h4>
          </div>
          
          {deployedExpanded && deployedContracts.map((contract, idx) => (
             <div key={idx} className="bg-[#1E1E1E] border border-[#333333] rounded mb-2">
                <div className="p-2 border-b border-[#333333] flex justify-between items-center text-[10px] text-white">
                   <div className="font-mono">{contract.name} at {contract.address.substring(0, 6)}...{contract.address.substring(38)}</div>
                   <div className="flex gap-2">
                     <Copy onClick={() => handleCopyAddress(contract.address)} className="w-3.5 h-3.5 cursor-pointer hover:text-[#007ACC]" />
                     <Trash onClick={() => handleRemoveContract(idx)} className="w-3.5 h-3.5 cursor-pointer hover:text-red-400" />
                   </div>
                </div>
                <div className="p-3 space-y-3 font-mono">
                   {/* store */}
                   <div className="flex gap-2">
                      <button onClick={handleTransactStore} className="bg-[#E47B36] hover:bg-[#C9692D] text-white px-3 py-1.5 rounded flex items-center">
                        store
                      </button>
                      <input 
                         type="text" 
                         className="flex-1 bg-[#3C3C3C] border-none px-2 py-1.5 rounded outline-none text-white text-[11px] min-w-0" 
                         placeholder="num"
                         value={storeInputValue}
                         onChange={e => setStoreInputValue(e.target.value)}
                         onKeyDown={e => {
                            if(e.key === 'Enter') handleTransactStore();
                         }}
                      />
                   </div>
                   {/* retrieve */}
                   <div className="flex gap-2 items-center">
                      <button onClick={handleCallRetrieve} className="bg-[#007ACC] hover:bg-[#005A9E] text-white px-3 py-1.5 rounded text-center w-[60px]">
                        retrieve
                      </button>
                      {retrieveResult && <div className="text-[#DCDCAA] text-[11px] ml-2">返回: {retrieveResult}</div>}
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // Full Render
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#1E1E1E] text-[#cccccc] overflow-hidden">
      {/* Platform Header */}
      <div className="h-12 bg-[#007ACC] flex items-center justify-between px-6 shrink-0 shadow z-50">
         <div className="flex items-center gap-3">
           <BookMarked className="text-white w-6 h-6" />
           <span className="text-white font-bold text-lg tracking-wide">区块链教学实验平台</span>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-blue-100 text-sm font-medium">用户：学生1</div>
            <button onClick={onClose} className="px-4 py-1.5 bg-rose-600/30 text-white rounded hover:bg-rose-500 transition-colors text-sm font-bold flex items-center gap-1.5 border border-rose-500/50">
               返回系统
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Leftmost Sidebar - My Tasks */}
        <div className="w-56 bg-[#252526] border-r border-[#333333] shrink-0 flex flex-col pt-6">
           <div className="text-[#858585] text-xs font-bold uppercase tracking-wider px-4 mb-4 select-none">我的任务</div>
           <div className="space-y-0.5 px-2">
              <div className="flex items-center gap-2 text-[#cccccc] hover:bg-[#2D2D2D] hover:text-white px-3 py-2 rounded cursor-pointer text-sm">
                 <ChevronRight className="w-4 h-4"/> 待完成任务
              </div>
              <div className="flex items-center gap-2 text-[#cccccc] hover:bg-[#2D2D2D] hover:text-white px-3 py-2 rounded cursor-pointer text-sm">
                 <ChevronRight className="w-4 h-4"/> 已完成任务
              </div>
              <div className="mt-4 pt-4 border-t border-[#333333] px-1" />
              <div className="flex items-center gap-2 text-[#cccccc] hover:bg-[#2D2D2D] hover:text-white px-3 py-2 rounded cursor-pointer text-sm font-medium">
                 <Layers className="w-4 h-4"/> 自由实验
              </div>
              <div className="flex items-center gap-2 text-white bg-[#007ACC]/10 border border-[#007ACC]/50 px-3 py-2 rounded cursor-pointer text-sm font-bold shadow-sm shadow-blue-900/20">
                 <BookMarked className="w-4 h-4 text-[#007ACC]"/> 智能合约IDE
              </div>
           </div>
        </div>

        {/* Mini vertical tool bar */}
        <div className="w-12 bg-[#333333] flex flex-col border-r border-[#1e1e1e] shrink-0 py-2 items-center">
            {renderSidebarIcon('fileBrowser', <FileText className="w-5 h-5"/>, "文件浏览器")}
            {renderSidebarIcon('search', <Search className="w-5 h-5"/>, "搜索")}
            {renderSidebarIcon('compile', <Layers className="w-5 h-5"/>, "Solidity 编译")}
            {renderSidebarIcon('deploy', <PlayCircle className="w-5 h-5"/>, "部署与执行交易")}
            {renderSidebarIcon('staticAnalysis', <CheckCircle className="w-5 h-5"/>, "静态分析")}
            {renderSidebarIcon('unitTest', <CheckSquare className="w-5 h-5"/>, "单元测试")}
            {renderSidebarIcon('debugger', <Bug className="w-5 h-5"/>, "调试器")}
            <div className="flex-1"></div>
            {renderSidebarIcon('settings', <Settings className="w-5 h-5"/>, "设置")}
        </div>

        {/* Dynamic Left Panel */}
        <div className="w-[320px] bg-[#252526] border-r border-[#1E1E1E] shrink-0 overflow-hidden flex flex-col">
           {activeIdeTool === 'fileBrowser' && (
              <div className="flex flex-col h-full">
                 <div className="px-4 py-3 border-b border-[#333]">
                   <span className="font-bold text-white text-xs block mb-1">智能合约IDE</span>
                   <span className="text-[#858585] text-xs">文件浏览器</span>
                 </div>
                 <div className="p-2 border-b border-[#333] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#cccccc]">{storageMode}</span>
                    <button onClick={() => {
                       const newMode = storageMode === "浏览器存储" ? "本地存储" : "浏览器存储";
                       setStorageMode(newMode);
                       showToast(`已切换到${newMode}`);
                    }} className="text-[#007ACC] hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer transition-colors bg-[#007ACC]/10 border border-transparent hover:border-[#007ACC]">切换</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-2 text-sm font-mono select-none text-[#cccccc]">
                    <div className="flex items-center gap-1.5"><ChevronDown className="w-4 h-4 text-[#858585]"/> Workspaces</div>
                     <div className="flex items-center gap-2 my-2 px-1 border-b border-[#333] pb-2">
                        <FilePlus onClick={() => { showToast('新建文件成功'); addLog('success', 'File created'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="新建文件" />
                        <FolderPlus onClick={() => { showToast('新建文件夹成功'); addLog('success', 'Folder created'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="新建文件夹" />
                        <PenLine onClick={() => { showToast('重命名成功'); addLog('success', 'File renamed'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="重命名" />
                        <Trash onClick={() => { showToast('删除文件成功'); addLog('success', 'File deleted'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="删除" />
                        <Upload onClick={() => { showToast('导入成功'); addLog('success', 'File imported'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="导入" />
                        <Download onClick={() => { showToast('导出成功'); addLog('success', 'File exported'); }} className="w-3.5 h-3.5 text-[#858585] hover:text-white cursor-pointer" title="导出" />
                     </div>
                    <div className="pl-5 flex items-center gap-1.5 mt-1 text-[#858585]"><ChevronDown className="w-4 h-4"/> default_workspace</div>
                    {storageMode === "浏览器存储" ? (
                       <div className="pl-9 mt-1">
                          <div className="flex items-center gap-1.5"><ChevronDown className="w-4 h-4 text-[#858585]"/> contracts</div>
                          <div className="pl-5 flex flex-col gap-0.5 mt-1">
                             <div className="flex items-center gap-1.5 text-[#858585]"><ChevronRight className="w-3.5 h-3.5"/> artifacts</div>
                             <div onClick={() => handleOpenFile('1_Storage.sol')} className={`flex items-center gap-1.5 cursor-pointer ${activeContractFile === '1_Storage.sol' ? 'text-[#DCDCAA] bg-[#37373D] outline outline-1 outline-[#007ACC]' : 'hover:bg-[#2A2D2E]'}`}><div className="w-3 h-3 text-emerald-400">S</div> 1_Storage.sol</div>
                             <div onClick={() => handleOpenFile('2_Owner.sol')} className={`flex items-center gap-1.5 cursor-pointer ${activeContractFile === '2_Owner.sol' ? 'text-[#DCDCAA] bg-[#37373D] outline outline-1 outline-[#007ACC]' : 'hover:bg-[#2A2D2E]'}`}><div className="w-3 h-3 text-emerald-400">S</div> 2_Owner.sol</div>
                             <div onClick={() => handleOpenFile('3_Ballot.sol')} className={`flex items-center gap-1.5 cursor-pointer ${activeContractFile === '3_Ballot.sol' ? 'text-[#DCDCAA] bg-[#37373D] outline outline-1 outline-[#007ACC]' : 'hover:bg-[#2A2D2E]'}`}><div className="w-3 h-3 text-emerald-400">S</div> 3_Ballot.sol</div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1"><ChevronRight className="w-4 h-4 text-[#858585]"/> scripts</div>
                           <div className="pl-5 flex flex-col gap-0.5 mt-1 text-[#858585]">
                              <div className="flex items-center gap-1.5 hover:bg-[#2A2D2E] text-white"><div className="w-3 h-3 text-[#4FC1FF] font-bold text-[10px]">TS</div> deploy_with_ethers.ts</div>
                           </div>
                          <div className="flex items-center gap-1.5 mt-1"><ChevronRight className="w-4 h-4 text-[#858585]"/> tests</div>
                           <div className="pl-5 flex flex-col gap-0.5 mt-1">
                              <div className="flex items-center gap-1.5 hover:bg-[#2A2D2E] text-[#DCDCAA]"><div className="w-3 h-3 text-emerald-400">S</div> Ballot_test.sol</div>
                              <div className="flex items-center gap-1.5 hover:bg-[#2A2D2E] text-[#DCDCAA]"><div className="w-3 h-3 text-emerald-400">S</div> Storage_test.sol</div>
                           </div>
                          <div className="flex items-center gap-1.5 mt-1"><ChevronRight className="w-4 h-4 text-[#858585]"/> .deps</div>
                           <div className="flex items-center gap-1.5 mt-1 hover:bg-[#2A2D2E] cursor-pointer"><FileText className="w-3.5 h-3.5 text-[#858585]"/> README.txt</div>
                       </div>
                    ) : (
                       <div className="pl-9 mt-1">
                          <div className="flex items-center gap-1.5"><ChevronDown className="w-4 h-4 text-[#858585]"/> local_contracts</div>
                          <div className="pl-5 flex flex-col mt-1">
                             <div className="flex items-center gap-1.5 hover:bg-[#2A2D2E]"><div className="w-3 h-3 text-emerald-400">S</div> my_local.sol</div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeIdeTool === 'compile' && renderCompilePanel()}
           {activeIdeTool === 'deploy' && renderDeployPanel()}
           
           {activeIdeTool === 'unitTest' && (
              <div className="flex flex-col h-full bg-[#252526] text-xs pb-4">
                 <div className="p-4 border-b border-[#333333] font-bold text-white uppercase">SOLIDITY 单元测试</div>
                 <div className="p-4 space-y-4">
                    <p className="text-[#858585]">测试智能合约的稳定性。<br/>选择要加载和生成测试文件的目录。</p>
                    <div className="bg-[#1E1E1E] border border-[#3C3C3C] px-3 py-2 text-white">tests</div>
                    <div className="flex gap-2">
                       <button onClick={() => showToast('创建新单元测试')} className="flex-1 py-1.5 bg-[#3C3C3C] hover:bg-[#4d4d4d] text-white rounded">Create</button>
                       <button onClick={handleGenerateTest} className="flex-1 py-1.5 bg-[#3C3C3C] hover:bg-[#4d4d4d] text-white rounded">生成</button>
                       <button onClick={() => showToast('请查阅相关文档')} className="flex-1 py-1.5 bg-[#3C3C3C] hover:bg-[#4d4d4d] text-white rounded">用法</button>
                    </div>
                    <div className="flex gap-2 bg-[#007ACC]/10 p-2 border border-[#007ACC]/30">
                       <button onClick={handleRunTest} className="flex-1 py-1.5 bg-[#0CA05B] hover:bg-[#09824A] text-white font-bold rounded">运行</button>
                       <button onClick={() => showToast('已停止测试')} className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded">Stop</button>
                    </div>
                    <label className="flex items-center gap-2"><input type="checkbox"/> 选择所有</label>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> tests/Ballot_test.sol</label>

                    {unitTestStatus === "PASS" && (
                       <div className="mt-4 p-3 border border-emerald-900 bg-[#1E1E1E] rounded">
                         <div className="text-emerald-400 font-bold flex items-center gap-2 mb-2"><span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px]">PASS</span> BallotTest (tests/1_Storage_test.sol)</div>
                         <div className="text-[#DCDCAA] space-y-1 font-mono pl-1">
                           <div className="flex items-center gap-2"><Check className="text-emerald-500 w-3 h-3"/> Check winning proposal</div>
                           <div className="flex items-center gap-2"><Check className="text-emerald-500 w-3 h-3"/> Check output value</div>
                         </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeIdeTool === 'debugger' && (
              <div className="flex flex-col h-full bg-[#252526] text-xs">
                 <div className="p-4 border-b border-[#333333] font-bold text-white uppercase">调试器</div>
                 <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center bg-[#1E1E1E] p-2 rounded">
                       <span className="text-[#858585]">当前状态:</span>
                       <span className={`font-bold ${debugStatus === '暂停在断点' ? 'text-rose-400' : 'text-emerald-400'}`}>{debugStatus}</span>
                    </div>

                    <div className="bg-[#1E1E1E] border border-[#3C3C3C] p-3 rounded space-y-2">
                       <div className="flex justify-between">当前交易: <span className="font-mono text-[#DCDCAA]">0xcall_tx_00...</span></div>
                       <div className="flex justify-between">当前方法: <span className="font-mono text-[#DCDCAA]">store(uint256)</span></div>
                       <div className="flex justify-between text-yellow-500">执行行: <span className="font-mono font-bold">第 {currentDebugLine} 行</span></div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       <button onClick={() => { showToast('请触发带有断点的交易'); addLog('info', 'Wait for transaction hit'); }} className="px-3 py-1.5 bg-[#007ACC] hover:bg-[#005A9E] text-white rounded">开始调试</button>
                       <button onClick={() => { showToast('当前上下文无需单步进入'); addLog('info', 'Step into executed'); }} className="px-3 py-1.5 bg-[#3C3C3C] hover:bg-[#4D4D4D] text-white rounded">单步进入</button>
                       <button onClick={handleStepOver} className="px-3 py-1.5 bg-[#3C3C3C] hover:bg-[#4D4D4D] text-white rounded outline outline-1 outline-amber-500/50">单步跳过</button>
                       <button onClick={handleContinueRunning} className="px-3 py-1.5 bg-[#0CA05B] hover:bg-[#09824A] text-white rounded">继续运行</button>
                    </div>

                    {debugStatus === '暂停在断点' && (
                       <div className="mt-4 pt-4 border-t border-[#333333]">
                         <div className="font-bold text-white mb-2">变量区</div>
                         <div className="mb-3">
                           <div className="text-[#858585] mb-1">局部变量:</div>
                           <div className="font-mono flex justify-between bg-[#1E1E1E] p-1.5"><span className="text-[#9CDCFE]">num</span><span className="text-emerald-400">uint256</span><span className="text-[#b5cea8]">{debugVariables.num}</span></div>
                         </div>
                         <div>
                           <div className="text-[#858585] mb-1">状态变量:</div>
                           <div className="font-mono flex justify-between bg-[#1E1E1E] p-1.5"><span className="text-[#9CDCFE]">number</span><span className="text-emerald-400">uint256</span><span className="text-[#b5cea8]">{debugVariables.number}</span></div>
                         </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeIdeTool === 'staticAnalysis' && (
              <div className="flex flex-col h-full bg-[#252526] text-xs pb-4">
                 <div className="p-4 border-b border-[#333333] font-bold text-white uppercase">静态分析</div>
                 <div className="p-4 space-y-4">
                    <button onClick={() => { setStaticAnalysisVisible(true); addLog('success', 'Static analysis executed'); }} className="w-full bg-[#007ACC] hover:bg-[#005A9E] text-white py-2 rounded text-xs font-bold">运行静态分析</button>
                    {staticAnalysisVisible && (
                       <div className="space-y-2">
                         {[
                           { name: "编译器版本检查", level: "低", msg: "版本范围 >=0.7.0 <0.9.0", line: "第 3 行", pass: true },
                           { name: "状态变量访问检查", level: "低", msg: "number 为状态变量", line: "第 11 行", pass: true },
                           { name: "Gas 消耗检查", level: "中", msg: "store 会写入链上状态", line: "第 18 行", pass: false },
                           { name: "重入风险检查", level: "低", msg: "未发现外部调用", line: "-", pass: true },
                           { name: "整数溢出风险检查", level: "低", msg: "未发现高风险运算", line: "-", pass: true },
                         ].map((item, idx) => (
                           <div key={idx} className="bg-[#1E1E1E] p-2 rounded flex flex-col gap-1 border border-[#333]">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-[#DCDCAA]">{item.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.pass ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{item.pass ? "通过" : "提示"}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[#858585]">{item.line}</span>
                                <span className="text-white opacity-80">{item.msg}</span>
                              </div>
                           </div>
                         ))}
                       </div>
                    )}
                 </div>
              </div>
           )}

           {(activeIdeTool === 'search') && (
              <div className="flex flex-col h-full bg-[#252526] text-xs">
                 <div className="px-4 py-3 border-b border-[#333]">
                   <span className="font-bold text-white text-xs block mb-1">搜索</span>
                 </div>
                 <div className="p-4 space-y-4">
                    <input type="text" className="w-full bg-[#3C3C3C] border-none px-2 py-1.5 rounded text-white outline-none" placeholder="搜索 (Enter 键)" />
                    <input type="text" className="w-full bg-[#3C3C3C] border-none px-2 py-1.5 rounded text-white outline-none" placeholder="替换" />
                 </div>
              </div>
           )}

           {(activeIdeTool === 'settings') && (
              <div className="flex flex-col h-full bg-[#252526] text-xs">
                 <div className="px-4 py-3 border-b border-[#333]">
                   <span className="font-bold text-white text-xs block mb-1">设置</span>
                 </div>
                 <div className="p-4 space-y-4 text-[#cccccc]">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 自动编译</label>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 代码自动换行</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> 开启代码折叠</label>
                 </div>
              </div>
           )}
        </div>

        {/* Main Editor + Right Minimap Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E] border-r border-[#1E1E1E]">
           {/* Editor Tabs & Toolbar */}
           <div className="bg-[#252526] flex items-center justify-between border-b border-[#1E1E1E] shadow-sm select-none">
              <div className="flex items-end">
                 <div className="px-4 py-2 hover:bg-[#2D2D2D] text-[#858585] text-xs cursor-pointer border-r border-[#333]">Home</div>
                 <div className="px-4 py-2 bg-[#1E1E1E] text-[#4FC1FF] text-xs font-medium border-t-2 border-[#007ACC] flex items-center gap-2 relative">
                    <div className="text-emerald-400 font-bold">S</div> {activeContractFile}
                    {!contractSavedStatus && <div className="w-1.5 h-1.5 rounded-full bg-white ml-1"/>}
                 </div>
              </div>
              <div className="flex items-center gap-2 pr-3">
                 <button onClick={handleSave} className="hover:bg-[#333] p-1.5 rounded text-[#cccccc]" title="保存"><Save className="w-4 h-4"/></button>
                 <button onClick={handleFormat} className="hover:bg-[#333] p-1.5 rounded text-[#cccccc]" title="格式化"><AlignLeft className="w-4 h-4"/></button>
                 <div className="w-px h-4 bg-[#333] mx-1"></div>
                 <button onClick={handleCompile} className="bg-[#333333] hover:bg-[#4D4D4D] text-white px-3 py-1 flex items-center gap-1 rounded font-medium text-xs">编译</button>
                 <button onClick={() => setActiveIdeTool('deploy')} className="bg-[#007ACC] hover:bg-[#005A9E] text-white px-3 py-1 flex items-center gap-1 rounded font-medium text-xs">部署并运行</button>
                 <div className="w-px h-4 bg-[#333] mx-1"></div>
                 <button onClick={handleAutoExperiment} className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 flex items-center gap-1 rounded text-xs"><FastForward className="w-4 h-4"/> 自动实验</button>
                 <button onClick={handleSingleStep} className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 flex items-center gap-1 rounded text-xs"><List className="w-4 h-4"/> 单步执行</button>
                 <button onClick={() => setResetConfirmVisible(true)} className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 flex items-center gap-1 rounded text-xs"><RotateCcw className="w-4 h-4"/> 重置实验</button>
              </div>
           </div>

           {/* Code Area */}
           <div className="flex-1 flex overflow-hidden relative group">
              <textarea
                value={contractCode}
                onChange={handleEditorChange}
                spellCheck={false}
                className="absolute inset-[0_20px_0_0] bg-transparent resize-none text-transparent caret-white pl-[50px] pr-4 py-4 font-mono text-sm leading-6 z-10 outline-none"
              />
              
              <div className="absolute inset-[0_20px_0_0] bg-[#1E1E1E] pointer-events-none flex py-4 text-sm font-mono leading-6">
                 {/* Line Numbers */}
                 <div className="w-[45px] shrink-0 text-right pr-2 text-[#858585] select-none flex flex-col pt-0 pb-0 z-20 pointer-events-auto border-r border-[#333333]">
                   {contractCode.split('\n').map((_, i) => {
                     const lineNum = i + 1;
                     const hasBreak = breakpoints.includes(lineNum);
                     const isDebugLine = currentDebugLine === lineNum;
                     const isErrorLine = compileStatus === '编译失败' && activeContractFile === '1_Storage.sol' && lineNum === 18;
                     return (
                        <div 
                          key={i} 
                          onClick={() => toggleBreakpoint(lineNum)}
                          className={`h-6 flex items-center justify-end pr-1 cursor-pointer hover:text-white ${isDebugLine ? 'bg-[#37373D]' : ''} ${isErrorLine ? 'bg-red-900/30 text-red-500 font-bold' : ''}`}
                        >
                          <div className="flex items-center gap-1 relative">
                            {hasBreak && <div className="absolute -left-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_red]"></div>}
                            <span className={isDebugLine ? 'text-yellow-400 font-bold' : ''}>{lineNum}</span>
                          </div>
                        </div>
                     )
                   })}
                 </div>
                 {/* Highlighted syntax */}
                 <div className="flex-1 pl-[5px] pr-4 z-0 overflow-visible whitespace-pre">
                   {contractCode.split('\n').map((line, i) => {
                      const isDebugLine = currentDebugLine === i + 1;
                      const isErrorLine = compileStatus === '编译失败' && activeContractFile === '1_Storage.sol' && i + 1 === 18;
                      
                      let html = line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        .replace(/\b(pragma|contract|function|public|view|returns|private)\b/g, '<span style="color:#569CD6">$1</span>')
                        .replace(/\b(uint256|address)\b/g, '<span style="color:#4EC9B0">$1</span>')
                        .replace(/\b(solidity|Storage)\b/g, '<span style="color:#4FC1FF">$1</span>')
                        .replace(/\b(number|num)\b/g, '<span style="color:#9CDCFE">$1</span>')
                        .replace(/(\/\/.*|\/\*\*[\s\S]*?\*\/|\s*\*.*)/g, '<span style="color:#6A9955">$1</span>');
                      
                      return (
                        <div key={i} className={`h-6 w-full relative ${isDebugLine ? 'bg-[#37373D]/60 outline outline-1 outline-yellow-600/30' : ''} ${isErrorLine ? 'bg-red-900/20' : ''}`}>
                           {isErrorLine && <div className="absolute bottom-1 left-0 w-full border-b-[2px] border-red-500 border-dotted" />}
                           <span dangerouslySetInnerHTML={{ __html: html || ' ' }}></span>
                        </div>
                      )
                   })}
                 </div>
              </div>

              {/* Fake minimap right bar */}
              <div className="w-[20px] bg-[#1a1a1a] absolute right-0 top-0 bottom-0 border-l border-[#252526] opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-full h-8 bg-white/10 rounded-sm mt-4"></div>
              </div>
           </div>

           {/* Console Drawer */}
           <div className="h-48 border-t-[3px] border-[#333333] bg-[#1E1E1E] flex flex-col shrink-0 font-mono text-xs select-none">
              <div className="h-8 bg-[#252526] border-b border-[#333] flex items-center justify-between px-2 shrink-0">
                 <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 border-b-2 border-[#007ACC] h-8 px-2 text-[#cccccc]"><Terminal className="w-3.5 h-3.5 text-[#007ACC]" /> 输出</div>
                   <div className="flex items-center gap-1.5 h-8 px-2 text-[#858585] cursor-pointer hover:bg-[#333]">交互日志</div>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-[#858585] text-[10px]">监听网络</span>
                   <div className="relative">
                      <Search className="w-3 h-3 absolute left-1.5 top-1.5 text-[#858585]" />
                      <input type="text" placeholder="按交易哈希或地址搜索" className="pl-6 pr-2 py-0.5 bg-[#3C3C3C] text-white border-none outline-none rounded-sm" />
                   </div>
                   <Trash className="w-3.5 h-3.5 text-[#858585] cursor-pointer hover:text-white ml-2" onClick={handleClearConsole} />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 selectable border-t-2 border-black/20">
                 {consoleLogs.map((log, i) => (
                    <div key={i} className="flex font-mono break-words leading-relaxed group">
                      <span className="text-[#858585] shrink-0 w-[70px]">[{log.time}]</span>
                      {log.type === 'error' && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mr-1.5 mt-0.5" />}
                      {log.type === 'success' && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mr-1.5 mt-0.5" />}
                      <span className={`flex-1 ${
                         log.type === 'error' ? 'text-red-400' :
                         log.type === 'warning' ? 'text-yellow-500' :
                         log.type === 'success' ? 'text-emerald-400' : 'text-[#cccccc]'
                      }`}>
                        {log.msg.split('\n').map((str, j) => <div key={j}>{str}</div>)}
                      </span>
                    </div>
                 ))}
                 <div className="h-4"></div> {/* spacer */}
              </div>
           </div>
        </div>
      </div>

      {resetConfirmVisible && (
        <div className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center font-sans">
          <div className="bg-[#252526] border border-[#333] rounded-lg p-6 max-w-lg w-full flex flex-col shadow-2xl">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2"><RotateCcw className="text-rose-400"/> 重置智能合约开发实验确认</h3>
            <p className="text-[#cccccc] text-sm mb-4 leading-relaxed">重置后将清空当前合约编译结果、部署实例、交易记录、调用结果、静态分析结果、单元测试结果、断点、调试状态和运行输出，恢复到初始开发状态，可重新练习合约编写、编译、部署、运行和调试流程。</p>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="text-rose-400 font-bold text-xs mb-2">将清空内容：</div>
                <ul className="text-[#858585] text-xs list-disc pl-4 space-y-1">
                  <li>编译结果 & 单元测试结果</li>
                  <li>部署实例与合约地址</li>
                  <li>交易记录与控制台输出</li>
                  <li>静态分析与调试状态断点</li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="text-emerald-400 font-bold text-xs mb-2">可保留内容：</div>
                <ul className="text-[#858585] text-xs list-disc pl-4 space-y-1">
                  <li>合约源代码</li>
                  <li>文件目录与保存状态</li>
                  <li>历史操作审计记录</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setResetConfirmVisible(false)} className="px-4 py-2 bg-[#333] hover:bg-[#4d4d4d] text-white rounded text-sm transition-colors">取消</button>
              <button onClick={handleReset} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-sm font-bold transition-colors">确认重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
