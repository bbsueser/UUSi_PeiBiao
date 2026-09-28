import React, { useState, useEffect } from "react";
import { 
  Maximize2, Minimize2, ChevronDown, 
  ChevronRight, Settings, X, BookOpen, Clock, 
  Trash2, PlayCircle, Activity, CheckCircle, Database, Server, Star, HelpCircle, FileText, Hexagon, Terminal, User, Layers, Pause, RefreshCw, ArrowLeft,
  FastForward, Info, List, AlertTriangle, RotateCcw
} from "lucide-react";

interface BlockchainSimulationClientProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function BlockchainSimulationClient({ onClose, showToast }: BlockchainSimulationClientProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [experimentDuration, setExperimentDuration] = useState(21); // in seconds

  const [currentTopMenu, setCurrentTopMenu] = useState("主页");
  const [selectedChapter, setSelectedChapter] = useState("以太坊");
  const [chapterMenuExpanded, setChapterMenuExpanded] = useState(true);
  const [myExperimentMenuExpanded, setMyExperimentMenuExpanded] = useState(true);
  const [isFavListExpanded, setIsFavListExpanded] = useState(true);
  const [showFavoritePanel, setShowFavoritePanel] = useState(false);

  const [favoriteExperiments, setFavoriteExperiments] = useState<any[]>([
    {
      id: "fav-init-2",
      name: "梅克尔树实验",
      chapter: "密码学技术",
      env: "区块链基础仿真平台",
      favoriteTime: "2026-06-08 10:20:10",
      status: "已收藏",
      savedState: {}
    },
    {
      id: "fav-init-3",
      name: "区块链结构实验",
      chapter: "区块链链式结构",
      env: "区块链基础仿真平台",
      favoriteTime: "2026-06-08 11:15:30",
      status: "已收藏",
      savedState: {}
    }
  ]);

  const [operationLogs, setOperationLogs] = useState<any[]>([
    {
      time: "10:18:00",
      type: "进入系统",
      experiment: "主页",
      content: "进入区块链基础仿真平台",
      result: "成功",
      operator: "学生1",
      mode: "手动",
      step: "无"
    }
  ]);

  const [blockchainPageMode, setBlockchainPageMode] = useState<"home" | "experiment">("home");
  // NFT Experiment States
  const NFT_PARAMS_OPTIONS = {
    background: ["绿色渐变", "紫色渐变", "橙色渐变"],
    hat: ["草帽", "礼帽", "红色棒球帽"],
    ornament: ["金色项链", "红色徽章", "玫瑰花"],
    glasses: ["圆框眼镜", "金边眼镜", "红框眼镜"],
    clothes: ["毛衣", "背包", "红色背心"]
  };

  const nftSteps = [
    { id: 1, name: "初始化 NFT 实验" },
    { id: 2, name: "随机生成参数" },
    { id: 3, name: "作者生成 NFT" },
    { id: 4, name: "设置 NFT 价格" },
    { id: 5, name: "上架 NFT 市场" },
    { id: 6, name: "切换交易页签" },
    { id: 7, name: "买家购买 NFT" },
    { id: 8, name: "输出实验结果" }
  ];

  const [nftExperimentMode, setNftExperimentMode] = useState<"未选择" | "自动" | "单步" | "已重置">("未选择");
  const [nftExperimentStatus, setNftExperimentStatus] = useState<"未开始" | "自动执行中" | "已暂停" | "单步执行中" | "已完成">("未开始");
  const [nftStepIndex, setNftStepIndex] = useState(0); 
  const [selectedNftParams, setSelectedNftParams] = useState({
    background: "绿色渐变",
    hat: "草帽",
    ornament: "金色项链",
    glasses: "圆框眼镜",
    clothes: "毛衣"
  });
  const [currentNft, setCurrentNft] = useState<any>(null); // To store current generated NFT
  const [nftImageState, setNftImageState] = useState<"未生成" | "已生成">("未生成");
  const [nftId, setNftId] = useState("NL NFT #0001");
  const [nftList, setNftList] = useState<any[]>([]); // List of generated NFTs available for listing
  const [selectedNftId, setSelectedNftId] = useState("");
  const [nftPrice, setNftPrice] = useState(10);
  const [nftMarketList, setNftMarketList] = useState<any[]>([]);
  const [nftTradeTab, setNftTradeTab] = useState<"上架" | "交易">("上架");
  const [selectedBuyer, setSelectedBuyer] = useState("学生2");
  const [nftTransactionRecords, setNftTransactionRecords] = useState<any[]>([]);
  const [nftExperimentResult, setNftExperimentResult] = useState<any>(null);
  const [nftResetConfirmVisible, setNftResetConfirmVisible] = useState(false);
  const [nftResetRecords, setNftResetRecords] = useState<any[]>([]);

  // Merkle Tree States
  const [merkleMode, setMerkleMode] = useState<"未选择" | "自动" | "单步" | "已重置">("未选择");
  const [merkleStatus, setMerkleStatus] = useState<"未开始" | "自动执行中" | "已暂停" | "单步执行中" | "已完成">("未开始");
  const [merkleStep, setMerkleStep] = useState(0); 
  const [merkleOutput, setMerkleOutput] = useState<string[]>([]);
  const [merkleResultVisible, setMerkleResultVisible] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [merklePracticeCount, setMerklePracticeCount] = useState(0);
  const [merkleResetCount, setMerkleResetCount] = useState(0);
  const [merkleLastReset, setMerkleLastReset] = useState("-");

  const merkleSteps = [
    { id: 1, name: "初始化交易数据" },
    { id: 2, name: "计算交易哈希" },
    { id: 3, name: "构建叶子节点" },
    { id: 4, name: "两两合并哈希" },
    { id: 5, name: "生成上层节点" },
    { id: 6, name: "计算 Merkle Root" },
    { id: 7, name: "写入区块头" },
    { id: 8, name: "输出实验结果" }
  ];

  const experiments = [
    { name: "链式结构实验", chapter: "区块链链式结构" },
    { name: "区块链结构实验", chapter: "区块链链式结构" },
    { name: "SHA256哈希算法实验", chapter: "密码学技术" },
    { name: "Ripemd-160哈希算法实验", chapter: "密码学技术" },
    { name: "国产SM4实验", chapter: "密码学技术" },
    { name: "梅克尔树实验", chapter: "密码学技术" },
    { name: "非对称加密实验", chapter: "密码学技术" },
    { name: "数据加密实验", chapter: "密码学技术" },
    { name: "数字签名实验", chapter: "密码学技术" },
    { name: "C/S模式实验", chapter: "P2P网络" },
    { name: "P2P模式实验", chapter: "P2P网络" },
    { name: "工作量证明（PoW）实验", chapter: "共识机制" },
    { name: "权益证明（PoS）实验", chapter: "共识机制" },
    { name: "股权证明（DPoS）实验", chapter: "共识机制" },
    { name: "实用拜占庭（PBFT）实验", chapter: "共识机制" },
    { name: "分布式一致性（RAFT）实验", chapter: "共识机制" },
    { name: "比特币账户实验", chapter: "比特币" },
    { name: "比特币发行机制实验", chapter: "比特币" },
    { name: "比特币交易流程实验", chapter: "比特币" },
    { name: "比特币UTXO实验", chapter: "比特币" },
    { name: "51%攻击实验", chapter: "比特币" },
    { name: "以太坊账户实验", chapter: "以太坊" },
    { name: "NFT实验", chapter: "以太坊" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setExperimentDuration(p => p + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const addLog = (type: string, content: string, experiment?: string, mode?: string, step?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    setOperationLogs(prev => [
      ...prev,
      {
        time: timeStr,
        type,
        experiment: experiment || currentTopMenu,
        content,
        result: "成功",
        operator: "学生1",
        mode: mode || "手动",
        step: step || "全部"
      }
    ]);
  };

  const isFavorited = favoriteExperiments.some(f => f.name === (currentTopMenu === "主页" ? "主页" : currentTopMenu));

  const handleFavoriteClick = () => {
    const expName = currentTopMenu === "主页" ? "主页" : currentTopMenu;
    if (isFavorited) {
      showToast("当前实验已在收藏列表中");
      return;
    }
    
    const now = new Date();
    const dt = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,"0")}-${now.getDate().toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    
    const newFav = {
      id: "fav-" + Date.now(),
      name: expName,
      chapter: selectedChapter,
      env: "区块链基础仿真平台",
      favoriteTime: dt,
      status: "已收藏",
      savedState: expName === "NFT实验" ? {
        nftId,
        selectedNftParams: { ...selectedNftParams },
        nftMarketList: [...nftMarketList],
        nftImageState,
        nftExperimentStatus,
        nftExperimentMode,
        nftStepIndex,
        currentNft,
        nftTransactionRecords: [...nftTransactionRecords]
      } : expName === "梅克尔树实验" ? {
        merkleStep,
        merkleStatus,
        merkleMode,
        merkleOutput: [...merkleOutput]
      } : {}
    };
    
    setFavoriteExperiments(prev => [...prev, newFav]);
    setIsFavListExpanded(true);
    setShowFavoritePanel(true);
    showToast("当前实验已收藏，可在收藏实验菜单中快速打开。");
    addLog("收藏实验", `已收藏 ${expName}`);
  };

  const handleUnfavorite = (id: string, name: string) => {
    setFavoriteExperiments(prev => prev.filter(f => f.id !== id));
    showToast(`已取消收藏：${name}`);
    addLog("取消收藏", `取消收藏：${name}`);
  };

  const handleRestoreFavorite = (fav: any) => {
    setShowFavoritePanel(false);
    
    setCurrentTopMenu(fav.name);
    setSelectedChapter(fav.chapter);
    if (fav.name !== "主页") {
      setBlockchainPageMode("experiment");
    } else {
      setBlockchainPageMode("home");
    }
    
    if (fav.name === "NFT实验" && fav.savedState) {
      setNftId(fav.savedState.nftId || "NL NFT #0001");
      setSelectedNftParams(fav.savedState.selectedNftParams || {
        background: "绿色渐变", hat: "草帽", ornament: "金色项链", glasses: "圆框眼镜", clothes: "毛衣"
      });
      setNftMarketList(fav.savedState.nftMarketList || []);
      setNftImageState(fav.savedState.nftImageState || "未生成");
      setNftExperimentStatus(fav.savedState.nftExperimentStatus || "未开始");
      setNftExperimentMode(fav.savedState.nftExperimentMode || "未选择");
      setNftStepIndex(fav.savedState.nftStepIndex || 0);
      setCurrentNft(fav.savedState.currentNft || null);
      setNftTransactionRecords(fav.savedState.nftTransactionRecords || []);
      addLog("打开收藏实验", `恢复 ${fav.savedState.nftId}`, fav.name);
    } else if (fav.name === "梅克尔树实验" && fav.savedState) {
      setMerkleStep(fav.savedState.merkleStep || 0);
      setMerkleStatus(fav.savedState.merkleStatus || "未开始");
      setMerkleMode(fav.savedState.merkleMode || "未选择");
      setMerkleOutput(fav.savedState.merkleOutput || []);
      addLog("打开收藏实验", `恢复 ${fav.name} 状态`, fav.name);
    } else {
      addLog("打开收藏实验", `恢复 ${fav.name}`, fav.name);
    }
    
    showToast(`已打开收藏实验：${fav.name}`);
  };

  // --- NFT Experiment Handlers ---

  const handleNftInit = () => {
    setNftExperimentStatus("单步执行中");
    setNftStepIndex(1);
    addLog("初始化实验", "初始化 NFT 实验", "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "初始化 NFT 实验");
  };

  const handleNftRandomizeParams = () => {
    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const newParams = {
      background: getRandom(NFT_PARAMS_OPTIONS.background),
      hat: getRandom(NFT_PARAMS_OPTIONS.hat),
      ornament: getRandom(NFT_PARAMS_OPTIONS.ornament),
      glasses: getRandom(NFT_PARAMS_OPTIONS.glasses),
      clothes: getRandom(NFT_PARAMS_OPTIONS.clothes)
    };
    setSelectedNftParams(newParams);
    
    // Auto increment NFT ID on random
    const randomId = `NL NFT #${Math.floor(Math.random() * 9000 + 1000).toString()}`;
    setNftId(randomId);
    
    showToast("NFT 参数已随机生成");
    addLog("随机生成参数", "背景、帽子、饰品、眼镜、衣服已更新", "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "随机生成参数");
    if (nftExperimentMode === "单步") setNftStepIndex(2);
  };

  const handleNftGenerate = () => {
    setNftImageState("已生成");
    const generatedNft = {
      id: nftId,
      name: nftId,
      tokenId: `token_${nftId.split("#")[1]}`,
      author: "学生1",
      owner: "学生1",
      status: "已铸造",
      params: { ...selectedNftParams }
    };
    setCurrentNft(generatedNft);
    setNftList(prev => [...prev, generatedNft]);
    setSelectedNftId(generatedNft.id);
    
    addLog("作者生成 NFT", generatedNft.id, "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "作者生成 NFT");
    if (nftExperimentMode === "单步") setNftStepIndex(3);
  };

  const handleNftSetPrice = () => {
    // This is a UI step in UI mode, but in auto/step we simulate it
    if (nftExperimentMode === "单步") setNftStepIndex(4);
  };

  const handleNftListToMarket = () => {
    if (!selectedNftId) {
      showToast("请先选择 NFT");
      return;
    }
    if (nftPrice === 0) {
      showToast("请设置 NFT 价格");
      return;
    }
    
    const nftToList = nftList.find(n => n.id === selectedNftId);
    if (!nftToList) return;

    // Check if already listed
    if (nftMarketList.some(n => n.nftId === selectedNftId)) {
       showToast("该 NFT 已经上架了");
       return;
    }

    const newMarketItem = {
      nftId: nftToList.id,
      nftName: nftToList.name,
      tokenId: nftToList.tokenId,
      owner: nftToList.owner,
      author: nftToList.author,
      price: nftPrice,
      status: "已上架",
      params: nftToList.params
    };
    
    setNftMarketList(prev => [...prev, newMarketItem]);
    setCurrentNft((prev: any) => ({ ...prev, status: "已上架" }));
    showToast("NFT 已上架市场");
    addLog("上架 NFT 市场", `价格 ${nftPrice}`, "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "上架 NFT 市场");
    if (nftExperimentMode === "单步") setNftStepIndex(5);
  };

  const handleNftSwitchTab = () => {
    setNftTradeTab("交易");
    if (nftExperimentMode === "单步") setNftStepIndex(6);
  };

  const handleNftBuy = () => {
    if (!selectedNftId) {
      showToast("请先选择 NFT");
      return;
    }
    const marketItemIndex = nftMarketList.findIndex(n => n.nftId === selectedNftId);
    if (marketItemIndex === -1) {
      showToast("未找到对应的市场信息");
      return;
    }
    
    const marketItem = nftMarketList[marketItemIndex];
    if (marketItem.owner === selectedBuyer) {
      showToast("不能购买自己拥有的 NFT");
      return;
    }

    const txHash = `tx_nft_${Math.floor(Math.random() * 90000 + 10000)}`;
    
    // Update Market List
    const updatedMarketList = [...nftMarketList];
    updatedMarketList[marketItemIndex] = {
      ...marketItem,
      owner: selectedBuyer,
      status: "已交易"
    };
    setNftMarketList(updatedMarketList);
    
    // Update Current NFT
    if (currentNft && currentNft.id === selectedNftId) {
      setCurrentNft({ ...currentNft, owner: selectedBuyer, txHash, status: "交易已确认" });
    }

    // Add Transaction Record
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    setNftTransactionRecords(prev => [{
      time: timeStr,
      nftId: selectedNftId,
      seller: marketItem.owner,
      buyer: selectedBuyer,
      price: marketItem.price,
      txHash,
      status: "成功"
    }, ...prev]);

    showToast("NFT 交易成功");
    addLog("购买 NFT", txHash, "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "买家购买 NFT");
    if (nftExperimentMode === "单步") setNftStepIndex(7);
  };

  const handleNftOutputResult = () => {
    const marketItem = nftMarketList.find(n => n.nftId === selectedNftId);
    if (!currentNft) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    
    setNftExperimentResult({
      nftId: currentNft.id,
      tokenId: currentNft.tokenId,
      author: currentNft.author,
      finalOwner: currentNft.owner,
      price: marketItem ? marketItem.price : currentNft.price,
      txHash: currentNft.txHash || "无",
      marketStatus: marketItem ? marketItem.status : "未上架",
      onChainStatus: currentNft.status,
      time: timeStr
    });
    
    setNftExperimentStatus("已完成");
    setNftStepIndex(8);
    addLog("输出结果", "NFT实验执行完毕", "NFT实验", nftExperimentMode === "自动" ? "自动" : "手动", "输出实验结果");
  };

  const handleNftStepReset = () => {
    if (nftStepIndex <= 0) {
      showToast("当前已是初始状态");
      return;
    }
    if (nftExperimentMode === "自动") {
      showToast("自动模式下无法单步重置");
      return;
    }

    const newStep = nftStepIndex - 1;
    
    if (nftStepIndex === 1) {
      setNftExperimentStatus("未开始");
      setNftExperimentMode("未选择");
    } else if (nftStepIndex === 3) {
      setNftImageState("未生成");
      setNftList(prev => prev.slice(0, Math.max(0, prev.length - 1)));
      if (currentNft && currentNft.id === nftId) setCurrentNft(null);
    } else if (nftStepIndex === 5) {
      setNftMarketList(prev => prev.slice(0, Math.max(0, prev.length - 1)));
      setCurrentNft((prev: any) => prev ? ({ ...prev, status: "已铸造" }) : prev);
    } else if (nftStepIndex === 6) {
      setNftTradeTab("上架");
    } else if (nftStepIndex === 7) {
      const lastTx = nftTransactionRecords[0];
      if (lastTx) {
          setNftTransactionRecords(prev => prev.slice(1));
          setNftMarketList(prev => {
             const mList = [...prev];
             const idx = mList.findIndex(x => x.nftId === lastTx.nftId);
             if (idx>=0) {
                mList[idx].owner = lastTx.seller;
                mList[idx].status = "已上架";
             }
             return mList;
          });
          setCurrentNft((prev: any) => prev ? ({ ...prev, owner: lastTx.seller, txHash: null, status: "已上架" }) : prev);
      }
    } else if (nftStepIndex === 8) {
      setNftExperimentResult(null);
      setNftExperimentStatus("单步执行中");
    }

    setNftStepIndex(newStep);
    addLog("单步重置", `撤回到了步骤${newStep}`, "NFT实验", "单步", `撤销步骤${nftStepIndex}`);
    showToast("已退回上一步");
  };

  const handleNftReset = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    
    setNftResetRecords(prev => [{
      time: timeStr,
      experiment: "NFT实验",
      beforeStatus: nftExperimentStatus,
      cleared: "NFT参数、市场数据、交易记录、步骤状态",
      result: "成功",
      operator: "学生1"
    }, ...prev]);

    setSelectedNftParams({ background: "绿色渐变", hat: "草帽", ornament: "金色项链", glasses: "圆框眼镜", clothes: "毛衣" });
    setNftId("NL NFT #0001");
    setCurrentNft(null);
    setNftImageState("未生成");
    setNftList([]);
    setSelectedNftId("");
    setNftPrice(10);
    setNftMarketList([]);
    setNftTradeTab("上架");
    setNftTransactionRecords([]);
    setNftExperimentResult(null);
    setNftExperimentStatus("未开始");
    setNftExperimentMode("已重置");
    setNftStepIndex(0);
    
    setShowResetConfirm(false);
    setNftResetConfirmVisible(false);
    showToast("NFT 实验已重置，可重新开始练习");
    addLog("恢复初始状态", "成功", "NFT实验", "重置", "全部");
  };

  const handleNftAutoRun = () => {
    setNftExperimentMode("自动");
    setNftExperimentStatus("自动执行中");
    setNftStepIndex(1);
    
    let step = 1;
    let autoSelectedNftId = "";
    
    const interval = setInterval(() => {
      step++;
      setNftStepIndex(step);
      
      if (step === 2) {
        // Randomize
        const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        const newParams = {
          background: getRandom(NFT_PARAMS_OPTIONS.background),
          hat: getRandom(NFT_PARAMS_OPTIONS.hat),
          ornament: getRandom(NFT_PARAMS_OPTIONS.ornament),
          glasses: getRandom(NFT_PARAMS_OPTIONS.glasses),
          clothes: getRandom(NFT_PARAMS_OPTIONS.clothes)
        };
        setSelectedNftParams(newParams);
        const randomId = `NL NFT #${Math.floor(Math.random() * 9000 + 1000).toString()}`;
        setNftId(randomId);
        addLog("随机生成参数", "成功", "NFT实验", "自动", "随机生成参数");
      } else if (step === 3) {
        // Generate
        setNftImageState("已生成");
        // capture latest nftId and selectedNftParams
        setNftId(currentId => {
            setSelectedNftParams(currentParams => {
                const generatedNft = {
                  id: currentId,
                  name: currentId,
                  tokenId: `token_${currentId.split("#")[1]}`,
                  author: "学生1",
                  owner: "学生1",
                  status: "已铸造",
                  params: { ...currentParams }
                };
                setCurrentNft(generatedNft);
                setNftList(prev => [...prev, generatedNft]);
                setSelectedNftId(currentId);
                autoSelectedNftId = currentId;
                addLog("生成 NFT", currentId, "NFT实验", "自动", "作者生成 NFT");
                return currentParams;
            });
            return currentId;
        });
      } else if (step === 4) {
        // List preparation basically nothing done but logging
        addLog("设置价格", "成功", "NFT实验", "自动", "设置 NFT 价格");
      } else if (step === 5) {
        // List
        setCurrentNft((prev: any) => {
            if (prev) {
                const newMarketItem = {
                  nftId: prev.id,
                  nftName: prev.name,
                  tokenId: prev.tokenId,
                  owner: prev.owner,
                  author: prev.author,
                  price: 10,
                  status: "已上架",
                  params: prev.params
                };
                setNftMarketList(list => [...list, newMarketItem]);
            }
            return prev ? { ...prev, status: "已上架" } : prev;
        });
        addLog("上架市场", "成功", "NFT实验", "自动", "上架 NFT 市场");
      } else if (step === 6) {
        setNftTradeTab("交易");
        addLog("切换页签", "成功", "NFT实验", "自动", "切换交易页签");
      } else if (step === 7) {
        // Buy
        const txHash = `tx_nft_${Math.floor(Math.random() * 90000 + 10000)}`;
        setNftMarketList(list => {
            const newList = [...list];
            if (newList.length > 0) {
                newList[newList.length -1].owner = "学生2";
                newList[newList.length -1].status = "已交易";
                
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
                setNftTransactionRecords(recs => [{
                  time: timeStr,
                  nftId: newList[newList.length-1].nftId,
                  seller: "学生1",
                  buyer: "学生2",
                  price: newList[newList.length-1].price,
                  txHash,
                  status: "成功"
                }, ...recs]);
            }
            return newList;
        });
        setCurrentNft((prev: any) => prev ? { ...prev, owner: "学生2", txHash, status: "交易已确认" } : prev);
        addLog("交易确认", txHash, "NFT实验", "自动", "买家购买 NFT");
      } else if (step === 8) {
        setNftExperimentStatus("已完成");
        
        setCurrentNft((prevCurrentNft: any) => {
           setNftMarketList(list => {
                const marketItem = list[list.length - 1];
                if (prevCurrentNft) {
                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
                    setNftExperimentResult({
                      nftId: prevCurrentNft.id,
                      tokenId: prevCurrentNft.tokenId,
                      author: prevCurrentNft.author,
                      finalOwner: "学生2",
                      price: marketItem ? marketItem.price : 10,
                      txHash: prevCurrentNft.txHash || "无",
                      marketStatus: "已交易",
                      onChainStatus: "交易已确认",
                      time: timeStr
                    });
                }
                return list;
           });
           return prevCurrentNft;
        });
        addLog("输出结果", "成功", "NFT实验", "自动", "输出实验结果");
        clearInterval(interval);
      }
    }, 800);
  };

  const handleNftSingleStep = () => {
    if (nftExperimentMode !== "单步") {
      setNftExperimentMode("单步");
      setNftExperimentStatus("单步执行中");
    }
    
    if (nftStepIndex === 0) {
      handleNftInit();
    } else if (nftStepIndex === 1) {
      handleNftRandomizeParams();
    } else if (nftStepIndex === 2) {
      handleNftGenerate();
    } else if (nftStepIndex === 3) {
      handleNftSetPrice();
    } else if (nftStepIndex === 4) {
      handleNftListToMarket();
    } else if (nftStepIndex === 5) {
      handleNftSwitchTab();
    } else if (nftStepIndex === 6) {
      handleNftBuy();
    } else if (nftStepIndex === 7) {
      handleNftOutputResult();
    } else if (nftStepIndex === 8) {
      showToast("NFT 实验已完成");
    }
  };

  const autoRunTimerRef = React.useRef<any>(null);

  useEffect(() => {
    if (merkleStatus === "自动执行中" && merkleStep < 8) {
      autoRunTimerRef.current = setTimeout(() => {
        executeMerkleStep(merkleStep + 1, "自动");
      }, 800);
    } else if (merkleStep >= 8 && merkleStatus === "自动执行中") {
      setMerkleStatus("已完成");
      setMerkleResultVisible(true);
    }
    return () => clearTimeout(autoRunTimerRef.current);
  }, [merkleStatus, merkleStep]);

  const executeMerkleStep = (stepCount: number, modeStr: string) => {
    setMerkleStep(stepCount);
    
    let newOutput = "";
    let contentName = "";
    if (stepCount === 1) {
      newOutput = "已加载 4 条交易数据。";
      contentName = "加载 4 条交易";
    } else if (stepCount === 2) {
      newOutput = "H1 = 0xa1b2c3\nH2 = 0xd4e5f6\nH3 = 0x11aa22\nH4 = 0x33bb44";
      contentName = "生成 H1-H4";
    } else if (stepCount === 3) {
      newOutput = "4 个叶子节点已加入 Merkle Tree。";
      contentName = "4 个叶子节点完成";
    } else if (stepCount === 4) {
      newOutput = "H12 = SHA256(H1 + H2)\nH34 = SHA256(H3 + H4)";
      contentName = "生成 H12、H34";
    } else if (stepCount === 5) {
      newOutput = "上层节点 H12、H34 已生成。";
      contentName = "上层节点生成";
    } else if (stepCount === 6) {
      newOutput = "Merkle Root = 0x9f8a7b6c5d4e3f21";
      contentName = "0x9f8a7b6c5d4e3f21";
    } else if (stepCount === 7) {
      newOutput = "Merkle Root 已写入 Block Header。";
      contentName = "写入 Block Header";
    } else if (stepCount === 8) {
      newOutput = "梅克尔树构建完成，交易完整性校验通过。";
      contentName = "构建完成，校验通过";
      setMerkleStatus("已完成");
      setMerkleResultVisible(true);
      setMerklePracticeCount(p => p + 1);
    }
    
    setMerkleOutput(prev => [...prev, newOutput]);
    const dName = merkleSteps[stepCount - 1].name;
    addLog(dName, contentName, "梅克尔树实验", modeStr, `步骤${stepCount}`);
  };

  const handleAutoRun = () => {
    if (merkleMode === "单步") {
       const userConfirm = window.confirm("当前为单步执行模式，是否切换为自动执行？");
       if (!userConfirm) return;
    }
    setMerkleMode("自动");
    setMerkleStatus("自动执行中");
    setMerkleResultVisible(false);
    if (merkleStep >= 8) {
       handleResetMerkle(true);
    } else if (merkleStep === 0) {
       addLog("开始自动实验", "启动自动实验", "梅克尔树实验", "自动", "全部步骤");
       executeMerkleStep(1, "自动");
    }
  };

  const handleStepRun = () => {
    if (merkleStep >= 8) {
      showToast("实验已完成，请重置后重新开始。");
      return;
    }
    if (merkleStatus === "自动执行中") {
       const userConfirm = window.confirm("当前为自动执行模式，是否切换为单步执行？");
       if (!userConfirm) return;
    }
    setMerkleMode("单步");
    setMerkleStatus("单步执行中");
    setMerkleResultVisible(false);
    
    if (merkleStep === 0) {
      addLog("开始单步实验", "启动单步实验", "梅克尔树实验", "单步", "全部步骤");
    }
    executeMerkleStep(merkleStep + 1, "单步");
  };

  const handlePauseContinue = () => {
    if (merkleStatus === "自动执行中") {
      setMerkleStatus("已暂停");
      addLog("暂停实验", "自动实验已暂停", "梅克尔树实验", "自动", `步骤${merkleStep}`);
    } else if (merkleStatus === "已暂停") {
      setMerkleStatus("自动执行中");
      addLog("继续实验", "自动实验继续执行", "梅克尔树实验", "自动", `步骤${merkleStep}`);
    }
  };

  const handleMerkleStepReset = () => {
    if (merkleStep <= 0) {
      showToast("当前已是初始状态");
      return;
    }
    if (merkleStatus === "自动执行中" || merkleStatus === "已暂停") {
      showToast("自动执行模式下无法单步重置，请先暂停或完全重置实验");
      return;
    }
    
    const newStep = merkleStep - 1;
    setMerkleStep(newStep);
    setMerkleOutput(prev => prev.slice(0, prev.length - 1));
    
    if (merkleStatus === "已完成") {
      setMerkleStatus("单步执行中");
    } else if (newStep === 0) {
      setMerkleStatus("未开始");
      setMerkleMode("未选择");
    }
    setMerkleResultVisible(false);
    
    addLog("单步重置", `撤回到了步骤${newStep}`, "梅克尔树实验", "单步", `撤销步骤${merkleStep}`);
    showToast("已退回上一步");
  };

  const handleResetMerkle = (autoContinue = false) => {
    setMerkleStep(0);
    setMerkleStatus("未开始");
    if (!autoContinue) setMerkleMode("已重置");
    setMerkleOutput([]);
    setMerkleResultVisible(false);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    setMerkleLastReset(timeStr);
    setMerkleResetCount(p => p + 1);
    
    addLog("恢复初始状态", "步骤状态、哈希结果、Merkle Root、区块头结果", "梅克尔树实验", "重置", "全部步骤");
    showToast("实验已重置，可重新开始练习");
    
    if (autoContinue) {
      setMerkleMode("自动");
      setMerkleStatus("自动执行中");
      executeMerkleStep(1, "自动");
    } else {
      setShowResetConfirm(false);
    }
  };

  const renderTopEnvironmentBar = () => (
    <div className="h-12 bg-slate-900 border-b border-blue-900/50 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-50 text-blue-100">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 font-bold text-white">
          <Database className="w-5 h-5 text-blue-400" />
          <span>实验环境：区块链基础仿真平台</span>
        </div>
        <div className="w-px h-5 bg-blue-800" />
        <div className="flex items-center gap-1.5 text-blue-300">
          <Clock className="w-4 h-4" /> 
          本次环境使用时长：{formatTime(experimentDuration)}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded border border-blue-800 text-sm">
          <User className="w-4 h-4 text-blue-400" /> 学生1
        </div>
        <button className="px-3 py-1.5 bg-slate-800 text-blue-200 rounded border border-blue-800 hover:bg-slate-700 text-sm flex items-center gap-1.5 transition-colors">
          <Terminal className="w-4 h-4"/> 终端
        </button>
        <button className="px-3 py-1.5 bg-slate-800 text-blue-200 rounded border border-blue-800 hover:bg-slate-700 text-sm">布局切换</button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-1.5 bg-slate-800 text-blue-200 rounded border border-blue-800 hover:bg-slate-700 text-sm">全屏</button>
        <button onClick={onClose} className="px-3 py-1.5 bg-red-900/50 text-red-300 rounded border border-red-800/50 hover:bg-red-900 text-sm transition-colors">结束环境</button>
      </div>
    </div>
  );

  const renderFarLeftNav = () => (
    <div className="w-20 bg-slate-900 border-r border-blue-900/50 flex flex-col items-center py-4 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.2)] z-20">
      <div className="flex flex-col gap-6 w-full px-2">
        <button className="flex flex-col items-center gap-2 text-blue-400 hover:text-blue-200 transition-colors">
          <BookOpen className="w-6 h-6" />
          <span className="text-[11px]">简介</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 text-white bg-blue-900/50 rounded-lg p-2 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          <FileText className="w-6 h-6 text-blue-300" />
          <span className="text-[11px] font-bold">操作手册</span>
        </button>
        <button className="flex flex-col items-center gap-2 text-blue-400 hover:text-blue-200 transition-colors">
          <Layers className="w-6 h-6" />
          <span className="text-[11px]">关联课程</span>
        </button>
      </div>
    </div>
  );

  const renderSubHeader = () => (
    <div className="h-14 bg-slate-800 border-b border-blue-900 flex items-center justify-between px-6 shrink-0 relative z-10">
      <div className="font-bold text-lg text-white flex items-center gap-2 tracking-wide">
        <Server className="w-5 h-5 text-blue-500" />
        {blockchainPageMode === "home" ? "区块链基础仿真平台" : currentTopMenu}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2">
          <div className="text-blue-300 text-sm">实验：</div>
          <select 
            value={currentTopMenu}
            onChange={(e) => {
              const val = e.target.value;
              setCurrentTopMenu(val);
              if (val === "主页") {
                setBlockchainPageMode("home");
              } else {
                setBlockchainPageMode("experiment");
              }
            }}
            className="bg-slate-900 border border-blue-800 text-blue-100 text-sm rounded py-1.5 pl-3 pr-8 appearance-none focus:outline-none focus:border-blue-500"
          >
            <option value="主页">主页</option>
            <option value="NFT实验">NFT实验</option>
            <option value="区块链结构实验">区块链结构实验</option>
            <option value="梅克尔树实验">梅克尔树实验</option>
            <option value="数字签名实验">数字签名实验</option>
            <option value="PoW实验">PoW实验</option>
            <option value="PoS实验">PoS实验</option>
            <option value="PBFT实验">PBFT实验</option>
          </select>
          <ChevronDown className="w-4 h-4 text-blue-400 absolute right-2 pointer-events-none" />
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isFavorited 
              ? "bg-blue-900/50 text-blue-300 border border-blue-500/30" 
              : "bg-slate-900 text-blue-400 border border-blue-800 hover:bg-slate-800"
          }`}
        >
          {isFavorited ? <Star className="w-4 h-4 fill-blue-400" /> : <Star className="w-4 h-4" />}
          {isFavorited ? "已收藏" : "收藏实验"}
        </button>
      </div>
    </div>
  );

  const renderLeftMenu = () => (
    <div className="w-56 bg-slate-900/80 border-r border-blue-900/50 flex flex-col shrink-0 text-blue-100 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <button 
            className="w-full flex items-center justify-between font-bold text-white bg-blue-900/30 px-3 py-2 rounded-t border-b border-blue-800"
            onClick={() => setChapterMenuExpanded(!chapterMenuExpanded)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              全部章节
            </div>
            {chapterMenuExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {chapterMenuExpanded && (
            <div className="flex flex-col bg-slate-900 border-x border-b border-blue-900 bg-opacity-50 rounded-b pb-1">
              {["区块链链式结构", "密码学技术", "P2P网络", "共识机制", "比特币", "以太坊", "区块链行业案例"].map(chapter => (
                <button 
                  key={chapter} 
                  onClick={() => { setSelectedChapter(chapter); setCurrentTopMenu("主页"); }}
                  className={`text-left px-4 py-2 text-sm transition-colors ${selectedChapter === chapter ? "text-white bg-blue-800/40 font-medium border-l-2 border-blue-400" : "text-blue-300 hover:bg-blue-900/20 hover:text-blue-200"}`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button 
            className="w-full flex items-center justify-between font-bold text-white bg-blue-900/30 px-3 py-2 rounded-t border-b border-blue-800"
            onClick={() => setMyExperimentMenuExpanded(!myExperimentMenuExpanded)}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              我的实验
            </div>
            {myExperimentMenuExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {myExperimentMenuExpanded && (
            <div className="flex flex-col bg-slate-900 border-x border-b border-blue-900 bg-opacity-50 rounded-b pb-1">
              <button className="text-left px-4 py-2 text-sm text-blue-300 hover:bg-blue-900/20 hover:text-blue-200">
                最近实验
              </button>
              <button 
                onClick={() => setIsFavListExpanded(!isFavListExpanded)}
                className="text-left px-4 py-2 text-sm text-blue-300 hover:bg-blue-900/20 hover:text-blue-200 flex justify-between items-center"
              >
                <div className="flex items-center gap-1.5">
                  {isFavListExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  收藏实验
                </div>
                {favoriteExperiments.length > 0 && (
                   <span className="bg-blue-600/50 text-blue-100 text-[10px] px-1.5 py-0.5 rounded-full">{favoriteExperiments.length}</span>
                )}
              </button>
              {isFavListExpanded && favoriteExperiments.length > 0 && (
                <div className="flex flex-col bg-slate-900/30 pb-2">
                  {favoriteExperiments.map(fav => (
                    <button 
                      key={fav.id} 
                      onClick={() => handleRestoreFavorite(fav)}
                      className="text-left pl-9 pr-4 py-1.5 text-xs text-blue-400 hover:text-white hover:bg-blue-800/40 truncate border-l-2 border-transparent hover:border-blue-500"
                    >
                      {fav.name}
                    </button>
                  ))}
                </div>
              )}
              {isFavListExpanded && favoriteExperiments.length === 0 && (
                <div className="pl-9 pr-4 py-2 text-xs text-slate-500">
                  暂无收藏
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHexagons = () => {
    return (
      <div className="flex-1 p-8 overflow-y-auto relative bg-[#090e17]">
        {/* Background circuit lines effect */}
         <div className="absolute inset-0 pattern-dots" style={{ backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px)' }} />
         
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 relative z-10 max-w-6xl mx-auto py-8">
           {experiments.map((exp, idx) => (
             <div 
                key={idx} 
                onClick={() => {
                  setCurrentTopMenu(exp.name);
                  setBlockchainPageMode("experiment");
                }}
                className={`flex flex-col items-center justify-center transform transition-transform hover:scale-105 cursor-pointer group`}
             >
               <div className="relative w-40 h-44 flex items-center justify-center">
                 {/* Hexagon SVG shape */}
                 <svg viewBox="0 0 100 115.47" className={`absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all ${currentTopMenu === exp.name ? 'fill-blue-800/80 stroke-blue-400' : 'fill-slate-800/80 stroke-blue-900 group-hover:stroke-blue-500 group-hover:fill-slate-700/80'}`} strokeWidth="2">
                   <polygon points="50 0, 100 28.86, 100 86.6, 50 115.47, 0 86.6, 0 28.86" />
                 </svg>
                 <div className="relative z-10 flex flex-col items-center text-center p-4">
                   <Hexagon className={`w-8 h-8 mb-2 ${currentTopMenu === exp.name ? 'text-white' : 'text-blue-500 group-hover:text-blue-300'}`} />
                   <div className="text-[10px] text-blue-300/70 mb-1 font-mono">{String(idx+1).padStart(2,'0')}</div>
                   <div className={`text-sm font-bold leading-tight ${currentTopMenu === exp.name ? 'text-white' : 'text-blue-100 group-hover:text-white'}`}>{exp.name}</div>
                   {favoriteExperiments.some(f => f.name === exp.name) && (
                     <Star className="w-3 h-3 text-yellow-400 mt-2 fill-yellow-400" />
                   )}
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>
    );
  };

  const renderMerkleExperiment = () => {
    return (
      <div className="flex-1 overflow-hidden bg-[#0a1120] relative p-6 text-blue-100 flex flex-col gap-6">
        <div className="absolute inset-0 pattern-dots pointer-events-none opacity-50" style={{ backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px)' }} />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between shrink-0">
           <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               梅克尔树实验
               {merkleStatus === "已完成" && <span className="bg-emerald-500/20 text-emerald-400 text-sm px-2 py-1 rounded font-medium border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> 已完成</span>}
             </h2>
             <p className="text-sm text-blue-300 mt-2 max-w-2xl">
               通过交易哈希逐层计算，生成 Merkle Root，理解区块中交易完整性校验过程。
             </p>
             <div className="flex gap-4 mt-3 text-xs text-blue-400 bg-slate-900/50 p-2 rounded-lg border border-blue-900/50 inline-flex items-center shadow-inner">
                <span>当前实验：<strong className="text-blue-300">梅克尔树实验</strong></span>
                <span className="w-px h-3 bg-blue-800" />
                <span>所属章节：密码学技术</span>
                <span className="w-px h-3 bg-blue-800" />
                <span>实验状态：<strong className={merkleStatus === "未开始" ? "text-slate-400" : merkleStatus === "已完成" ? "text-emerald-400" : "text-blue-300"}>{merkleStatus}</strong></span>
                <span className="w-px h-3 bg-blue-800" />
                <span>实验模式：<strong className="text-blue-300">{merkleMode}</strong></span>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="text-xs text-blue-500/80 mr-4 text-right hidden lg:block">
                <div className="mb-0.5 font-bold">支持模式：自动实验、单步执行、单步重置、重置实验</div>
                <div className="text-[10px] w-64 truncate" title="适用实验：链式结构实验、区块链结构实验、SHA256哈希算法实验、梅克尔树实验、数字签名实验、PoW实验、NFT实验">适用实验：链式结构实验、区块链结构、SHA256哈希、梅克尔树、数字签名、PoW、NFT</div>
              </div>
              <button 
                onClick={handleAutoRun}
                disabled={merkleStatus === "自动执行中"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  merkleStatus === "自动执行中" ? "bg-slate-800/80 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                }`}
              >
                <PlayCircle className="w-4 h-4" /> 自动实验
              </button>
              
              <button 
                onClick={handleStepRun}
                disabled={merkleStatus === "已完成"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  merkleStatus === "已完成" ? "bg-slate-800/80 text-slate-500 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-700 hover:border-blue-500"
                }`}
              >
                <ChevronRight className="w-4 h-4" /> 单步执行
              </button>

              <button 
                onClick={handleMerkleStepReset}
                disabled={!(merkleMode === "单步" && merkleStep > 0 && merkleStatus !== "自动执行中" && merkleStatus !== "已暂停")}
                className={`flex items-center gap-2 px-4 py-2 ${
                  (merkleMode === "单步" && merkleStep > 0 && merkleStatus !== "自动执行中" && merkleStatus !== "已暂停")
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600"
                    : "bg-slate-800/50 text-slate-500 border border-slate-800/50 opacity-50 cursor-not-allowed"
                } rounded-lg font-bold text-sm transition-all`}
              >
                <RotateCcw className="w-4 h-4" /> 单步重置
              </button>
              
              {(merkleStatus === "自动执行中" || merkleStatus === "已暂停") && (
                <button 
                  onClick={handlePauseContinue}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 text-amber-500 border border-amber-700/50 rounded-lg font-bold text-sm transition-all"
                >
                  {merkleStatus === "自动执行中" ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  {merkleStatus === "自动执行中" ? "暂停" : "继续"}
                </button>
              )}

              <button 
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-lg font-bold text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" /> 重置实验
              </button>

              <button 
                onClick={() => {
                  setCurrentTopMenu("主页");
                  setBlockchainPageMode("home");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold text-sm transition-all ml-2"
              >
                <ArrowLeft className="w-4 h-4" /> 返回主页
              </button>
           </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 relative z-10 min-h-0">
           <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
           
           {/* Left: Steps list */}
           <div className="col-span-3 bg-slate-900/60 border border-blue-900/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
             <div className="p-4 bg-blue-900/30 border-b border-blue-900/50 flex items-center justify-between">
               <h3 className="font-bold flex items-center gap-2 text-white">
                 <Terminal className="w-4 h-4 text-blue-400" /> 实验步骤
               </h3>
               <span className="text-xs text-blue-400">{merkleStep}/8</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {merkleSteps.map(step => {
                 const isActive = step.id === merkleStep;
                 const isCompleted = step.id < merkleStep || merkleStatus === "已完成";
                 
                 let statusText = "未开始";
                 let statusColor = "text-slate-500 bg-slate-800 border-slate-700";
                 if (isCompleted) {
                   statusText = "已完成";
                   statusColor = "text-emerald-400 bg-emerald-900/30 border-emerald-500/30";
                 } else if (isActive) {
                   statusText = "进行中";
                   statusColor = "text-blue-300 bg-blue-900/50 border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]";
                 }

                 return (
                   <div key={step.id} className={`p-3 rounded-lg border-l-4 transition-all ${isActive ? 'border-l-blue-400 bg-blue-900/20' : isCompleted ? 'border-l-emerald-500 bg-slate-800/40' : 'border-l-slate-700 bg-slate-800/40 opacity-70'}`}>
                     <div className="flex justify-between items-center mb-1.5">
                       <div className={`font-bold text-sm ${isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                         {step.id}. {step.name}
                       </div>
                       {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                     </div>
                     <div className="flex justify-between items-center">
                       <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor}`}>
                         {statusText}
                       </span>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>

           {/* Middle: Visualization Area */}
           <div className="col-span-6 bg-slate-900/60 border border-blue-900/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm relative">
             <div className="p-4 bg-blue-900/30 border-b border-blue-900/50 relative z-20">
               <h3 className="font-bold flex items-center gap-2 text-white">
                 <Activity className="w-4 h-4 text-blue-400" /> 实验过程可视化
               </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 relative flex flex-col items-center">
                {/* Visualizing Merkle Tree Process */}
                <div className="w-full max-w-lg mb-8">
                  <div className="text-sm text-blue-300 font-bold mb-3 border-b border-blue-900/50 pb-2">交易数据 (Transactions)</div>
                  <div className="grid grid-cols-4 gap-2">
                     <div className="bg-slate-800 p-2 rounded border border-slate-700 text-xs text-center text-slate-300">
                       <div className="font-bold text-blue-400 mb-1">Tx1</div>
                       Alice <ChevronRight className="inline w-3 h-3 text-slate-500"/> Bob<br/>10 BTC
                     </div>
                     <div className="bg-slate-800 p-2 rounded border border-slate-700 text-xs text-center text-slate-300">
                       <div className="font-bold text-blue-400 mb-1">Tx2</div>
                       Bob <ChevronRight className="inline w-3 h-3 text-slate-500"/> Carol<br/>5 BTC
                     </div>
                     <div className="bg-slate-800 p-2 rounded border border-slate-700 text-xs text-center text-slate-300">
                       <div className="font-bold text-blue-400 mb-1">Tx3</div>
                       Carol <ChevronRight className="inline w-3 h-3 text-slate-500"/> David<br/>2 BTC
                     </div>
                     <div className="bg-slate-800 p-2 rounded border border-slate-700 text-xs text-center text-slate-300">
                       <div className="font-bold text-blue-400 mb-1">Tx4</div>
                       David <ChevronRight className="inline w-3 h-3 text-slate-500"/> Alice<br/>1 BTC
                     </div>
                  </div>
                </div>

                {merkleStep >= 2 ? (
                  <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                    
                    {/* Layer 0: Root */}
                    <div className="mb-0 flex justify-center w-full relative z-10">
                      {merkleStep >= 6 ? (
                         <div className="text-center">
                           <div className="bg-emerald-900/60 p-3 rounded-lg border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
                             <div className="text-emerald-400 font-bold text-sm mb-1">Merkle Root</div>
                             <div className="font-mono text-emerald-300 text-xs">0x9f8a7b6c...3f21</div>
                           </div>
                           {merkleStep >= 7 && (
                              <div className="mt-3 text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-emerald-500/20 animate-in slide-in-from-top-2">
                                <Database className="w-3 h-3" /> 已写入 Block Header
                              </div>
                           )}
                         </div>
                      ) : (
                         <div className="bg-slate-800/50 p-3 rounded-lg border-2 border-dashed border-slate-700 text-slate-500 text-sm text-center w-40">
                           等待计算 Root
                         </div>
                      )}
                    </div>
                    
                    {/* Connector Root to L1 */}
                    <div className="flex w-[240px] justify-between h-8 relative mt-0">
                      {(merkleStep >= 6) && (
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          <path d="M 120 0 L 10 32" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                          <path d="M 120 0 L 230 32" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                        </svg>
                      )}
                    </div>

                    {/* Layer 1: H12, H34 */}
                    <div className="flex w-[320px] justify-between relative z-10">
                      {merkleStep >= 5 ? (
                         <div className="bg-blue-900/60 p-2.5 rounded border border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.2)] text-center w-32 animate-in zoom-in">
                           <div className="text-blue-300 font-bold text-xs mb-1">H12</div>
                           <div className="font-mono text-emerald-200 text-[10px]">H(H1+H2)</div>
                         </div>
                      ) : (
                         <div className="bg-slate-800/50 p-2.5 rounded border border-dashed border-slate-700 text-slate-600 text-xs text-center w-32">
                           {merkleStep >= 4 ? "正在计算..." : "等待合并"}
                         </div>
                      )}
                      
                      {merkleStep >= 5 ? (
                         <div className="bg-blue-900/60 p-2.5 rounded border border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.2)] text-center w-32 animate-in zoom-in">
                           <div className="text-blue-300 font-bold text-xs mb-1">H34</div>
                           <div className="font-mono text-emerald-200 text-[10px]">H(H3+H4)</div>
                         </div>
                      ) : (
                         <div className="bg-slate-800/50 p-2.5 rounded border border-dashed border-slate-700 text-slate-600 text-xs text-center w-32">
                           {merkleStep >= 4 ? "正在计算..." : "等待合并"}
                         </div>
                      )}
                    </div>
                    
                    {/* Connector L1 to L2 */}
                    <div className="flex w-[320px] justify-between h-8 relative mt-0">
                      <div className="w-16 h-full absolute left-8">
                        {merkleStep >= 4 && (
                           <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                             <path d="M 32 0 L 0 32" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                             <path d="M 32 0 L 64 32" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                           </svg>
                        )}
                      </div>
                      <div className="w-16 h-full absolute right-8">
                        {merkleStep >= 4 && (
                           <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                             <path d="M 32 0 L 0 32" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                             <path d="M 32 0 L 64 32" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                           </svg>
                        )}
                      </div>
                    </div>

                    {/* Layer 2: Leaves (H1, H2, H3, H4) */}
                    <div className="grid grid-cols-4 gap-4 w-full max-w-lg mt-0 relative z-10">
                       {[1,2,3,4].map(idx => (
                         <div key={idx} className={`p-2 rounded border text-center transition-all ${
                           merkleStep >= 3 
                             ? "bg-slate-800/80 border-blue-500/50 shadow-inner" 
                             : "bg-slate-800/30 border-slate-700"
                         }`}>
                           <div className={`font-bold text-[11px] mb-1 ${merkleStep >= 3 ? "text-blue-300" : "text-slate-500"}`}>
                             Hash {idx}
                           </div>
                           <div className="font-mono text-slate-400 text-[9px] truncate">
                             {merkleStep >= 2 ? (idx===1?"0xa1b2c3":idx===2?"0xd4e5f6":idx===3?"0x11aa22":"0x33bb44") : "---"}
                           </div>
                         </div>
                       ))}
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-2">
                    <Hexagon className="w-12 h-12 text-slate-700" />
                    <div>等待计算交易哈希</div>
                  </div>
                )}
             </div>

             {/* Confirmation Modal */}
             {showResetConfirm && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-slate-900 border border-blue-900 shadow-2xl rounded-xl p-6 max-w-sm w-full mx-4 text-center">
                    <RefreshCw className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">重置实验确认</h3>
                    <p className="text-sm text-slate-300 mb-6 text-left leading-relaxed">
                      重置后将清空当前实验过程、步骤状态、输出结果和操作日志中的本轮执行内容，实验将恢复到初始状态，可重新进行自动或单步练习。
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors">
                        取消
                      </button>
                      <button onClick={() => handleResetMerkle(false)} className="px-4 py-2 rounded bg-red-600/90 text-white hover:bg-red-500 font-medium transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                        确认重置
                      </button>
                    </div>
                  </div>
                </div>
             )}
           </div>

           {/* Right: Console & Output */}
           <div className="col-span-3 flex flex-col gap-4 min-h-0">
             
             {merkleResultVisible && (
               <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-4 shrink-0 animate-in slide-in-from-right-4 duration-500">
                 <h3 className="font-bold flex items-center gap-2 text-emerald-400 mb-3 border-b border-emerald-900/50 pb-2">
                   <CheckCircle className="w-4 h-4" /> 实验结果
                 </h3>
                 <div className="space-y-2 text-xs">
                   <div className="flex justify-between"><span className="text-emerald-500/70">实验名称：</span><span className="text-emerald-300">梅克尔树实验</span></div>
                   <div className="flex justify-between"><span className="text-emerald-500/70">实验模式：</span><span className="text-emerald-300">{merkleMode}</span></div>
                   <div className="flex justify-between"><span className="text-emerald-500/70">交易数量：</span><span className="text-emerald-300">4</span></div>
                   <div className="flex justify-between"><span className="text-emerald-500/70">叶子节点：</span><span className="text-emerald-300">4</span></div>
                   <div className="flex justify-between"><span className="text-emerald-500/70">上层节点：</span><span className="text-emerald-300">2</span></div>
                   <div className="mt-2 pt-2 border-t border-emerald-900/30">
                     <span className="text-emerald-500/70 block mb-1">Merkle Root：</span>
                     <span className="text-emerald-200 font-mono text-[10px] break-all bg-emerald-950/50 p-1.5 rounded block">0x9f8a7b6c5d4e3f21</span>
                   </div>
                   <div className="flex justify-between mt-2"><span className="text-emerald-500/70">写入区块：</span><span className="text-emerald-300">Block #12</span></div>
                   <div className="flex justify-between"><span className="text-emerald-500/70">校验结果：</span><span className="text-emerald-400 font-bold">通过</span></div>
                 </div>
               </div>
             )}

             <div className="bg-slate-900/60 border border-blue-900/50 rounded-xl flex flex-col flex-1 overflow-hidden backdrop-blur-sm">
               <div className="p-4 bg-blue-900/30 border-b border-blue-900/50">
                 <h3 className="font-bold flex items-center gap-2 text-white">
                   <Settings className="w-4 h-4 text-blue-400" /> 实验控制台
                 </h3>
               </div>
               <div className="p-4 flex-1 overflow-y-auto space-y-5">
                 
                 <div>
                   <div className="text-xs text-blue-400 font-bold mb-2">输入参数</div>
                   <div className="bg-slate-800/50 rounded p-2 text-xs space-y-1.5 text-slate-300 border border-slate-700/50">
                     <div className="flex justify-between"><span>交易数量：</span><span className="text-white">4</span></div>
                     <div className="flex justify-between"><span>哈希算法：</span><span className="text-white font-mono">SHA256</span></div>
                     <div className="flex justify-between"><span>合并规则：</span><span className="text-white">两两合并</span></div>
                     <div className="flex justify-between"><span>输出目标：</span><span className="text-emerald-400">生成 Merkle Root</span></div>
                   </div>
                 </div>

                 {merkleStep > 0 && merkleStep <= 8 && merkleSteps[merkleStep - 1] && (
                   <div className="animate-in fade-in">
                     <div className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-1">
                       <Activity className="w-3 h-3"/> 当前步骤：{merkleSteps[merkleStep - 1].name}
                     </div>
                     <div className="bg-blue-900/20 text-blue-200 p-2.5 rounded text-xs leading-relaxed border border-blue-900/50">
                       {merkleStep === 1 && "系统对预设的 4 条交易记录进行初始化，准备进入哈希计算阶段。"}
                       {merkleStep === 2 && "系统对每条单独的交易内容进行 SHA256 哈希计算，生成初步的哈希串。"}
                       {merkleStep === 3 && "将计算得到的交易哈希作为底层叶子节点，加入到 Merkle Tree 的结构中。"}
                       {merkleStep === 4 && "将相邻的两个叶子节点哈希值进行拼接，并再次进行 SHA256 计算。"}
                       {merkleStep === 5 && "合并后的哈希值形成了上一层的结构节点（非叶子节点）。"}
                       {merkleStep === 6 && "重复进行两两合并，直至整个树结构只剩下一个顶点，即为 Merkle Root（梅克尔根）。"}
                       {merkleStep === 7 && "将计算出的 Merkle Root 写入当前区块的 Block Header（区块头）中。"}
                       {merkleStep === 8 && "区块头封装完成，用于确保区块体内所有交易数据的完整性防篡改。"}
                     </div>
                   </div>
                 )}

                 {merkleOutput.length > 0 && (
                   <div className="flex-1 flex flex-col pt-2 border-t border-slate-700/50">
                     <div className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-1">
                       <Terminal className="w-3 h-3"/> 当前输出
                     </div>
                     <div className="bg-[#050914] flex-1 rounded p-3 text-[11px] font-mono whitespace-pre-wrap text-emerald-400 border border-slate-800 overflow-y-auto max-h-48 leading-relaxed shadow-inner">
                       {merkleOutput.map((out, idx) => (
                         <div key={idx} className="mb-2 animate-in slide-in-from-left-2 opacity-90">{out}</div>
                       ))}
                       {merkleStatus !== "已完成" && <span className="animate-pulse inline-block w-2.5 h-3 bg-emerald-500 opacity-70 ml-1"></span>}
                     </div>
                   </div>
                 )}
               </div>
             </div>
             
             {/* Stats Panel */}
             <div className="bg-slate-900/60 border border-blue-900/50 rounded-xl p-3 flex justify-between items-center text-[10px] text-slate-400">
               <div>重置次数: <span className="text-blue-300 font-mono">{merkleResetCount}</span></div>
               <div>最近重置: <span className="text-blue-300 font-mono">{merkleLastReset}</span></div>
               <div>练习次数: <span className="text-blue-300 font-mono">{merklePracticeCount}</span></div>
             </div>
           </div>
           </div>

           {/* Bottom: Operation Logs Area */}
           <div className="h-44 bg-slate-900/60 border border-blue-900/50 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm shrink-0">
             <div className="p-3 bg-blue-900/30 border-b border-blue-900/50 font-bold flex items-center gap-2 text-white text-sm">
               <FileText className="w-4 h-4 text-blue-400" /> 操作日志
             </div>
             <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] text-blue-200">
                <div className="flex gap-4 font-bold text-blue-400 border-b border-blue-900/50 pb-2 mb-2 px-2">
                  <span className="w-20 shrink-0">时间</span>
                  <span className="w-32 shrink-0">实验名称</span>
                  <span className="w-16 shrink-0">模式</span>
                  <span className="w-20 shrink-0">步骤</span>
                  <span className="w-28 shrink-0">操作内容</span>
                  <span className="flex-1">输出结果</span>
                  <span className="w-12 text-right shrink-0">状态</span>
                </div>
                <div className="flex flex-col-reverse">
                  {operationLogs.reverse().map((log, idx) => (
                    <div key={idx} className="flex gap-4 py-1.5 hover:bg-slate-800/50 px-2 rounded -mx-2 items-center transition-colors">
                      <span className="text-slate-500 w-20 shrink-0">{log.time}</span>
                      <span className="text-slate-300 w-32 shrink-0 truncate">{log.experiment}</span>
                      <span className="text-indigo-300 w-16 shrink-0">{log.mode}</span>
                      <span className="text-slate-400 w-20 shrink-0 truncate">{log.step}</span>
                      <span className="text-blue-400 w-28 shrink-0">{log.type}</span>
                      <span className="flex-1 truncate text-emerald-100">{log.content}</span>
                      <span className="text-emerald-500 w-12 text-right shrink-0 font-bold">{log.result}</span>
                    </div>
                  ))}
                </div>
             </div>
           </div>

        </div>
      </div>
    );
  };

  const renderNFTExperiment = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#090e17] relative text-blue-100 overflow-hidden">
        {/* Background circuit lines effect */}
        <div className="absolute inset-0 pattern-dots pointer-events-none opacity-50" style={{ backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)' }} />
        
        {/* NFT Experiment Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-blue-900/60 shrink-0 relative z-10 shadow-md">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-lg text-white">NFT实验</span>
             </div>
             
             {nftExperimentMode !== "未选择" && (
                <div className="px-3 py-1 bg-blue-900/40 border border-blue-800/50 rounded-full text-xs text-blue-300 font-mono shadow-[inset_0_0_8px_rgba(30,58,138,0.5)]">
                  MODE: <span className="text-white ml-1 font-bold">{nftExperimentMode}</span>
                  <span className="mx-2 text-blue-700">|</span>
                  <span className="text-emerald-400">{nftExperimentStatus}</span>
                </div>
             )}
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={handleNftAutoRun}
                disabled={nftExperimentMode === "自动"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  nftExperimentMode === "自动" ? "bg-slate-800/80 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                }`}
              >
                <PlayCircle className="w-4 h-4" /> 自动实验
              </button>
              
              <button 
                onClick={handleNftSingleStep}
                disabled={nftExperimentStatus === "已完成" || nftExperimentMode === "自动"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  (nftExperimentStatus === "已完成" || nftExperimentMode === "自动") ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                }`}
              >
                <FastForward className="w-4 h-4" /> 单步执行
              </button>

              <button 
                onClick={handleNftStepReset}
                disabled={!(nftExperimentMode === "单步" && nftStepIndex > 0)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  (nftExperimentMode === "单步" && nftStepIndex > 0)
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600"
                    : "bg-slate-800/50 text-slate-500 border border-slate-800/50 opacity-50 cursor-not-allowed"
                } rounded-lg font-bold text-sm transition-all`}
              >
                <RotateCcw className="w-4 h-4" /> 单步重置
              </button>

              <button 
                onClick={() => setNftResetConfirmVisible(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/80 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-lg font-bold text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" /> 重置实验
              </button>

              <button 
                onClick={() => {
                  setCurrentTopMenu("主页");
                  setBlockchainPageMode("home");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold text-sm transition-all ml-2"
              >
                <ArrowLeft className="w-4 h-4" /> 返回主页
              </button>
           </div>
        </div>

        {/* NFT Experiment Main Content Grid */}
        <div className="flex-1 flex min-h-0 relative z-10 w-full overflow-hidden p-6 gap-6 grid grid-cols-[240px_350px_1fr] items-start">
            
            {/* Column 1: Steps & Records */}
            <div className="flex flex-col gap-6 h-full min-h-0">
                <div className="bg-slate-800/60 border border-blue-900/60 rounded-xl flex flex-col flex-none shadow-lg">
                    <div className="bg-slate-900/80 border-b border-blue-900/50 p-3 flex items-center justify-between rounded-t-xl">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                            <List className="w-4 h-4 text-blue-500" /> 实验步骤
                        </div>
                        <div className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50">
                            {Math.min(nftStepIndex, nftSteps.length)} / {nftSteps.length}
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {nftSteps.map((step, idx) => {
                            const isCurrent = nftStepIndex === step.id;
                            const isPast = nftStepIndex > step.id;
                            return (
                                <div key={step.id} className="flex gap-3">
                                    <div className="flex flex-col items-center pt-0.5 relative">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                                            isCurrent ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' :
                                            isPast ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' :
                                            'bg-slate-700 text-slate-400'
                                        }`}>
                                            {isPast ? <CheckCircle className="w-3 h-3" /> : step.id}
                                        </div>
                                        {idx < nftSteps.length - 1 && (
                                            <div className={`w-0.5 h-full absolute top-5 -bottom-3 ${isPast ? 'bg-emerald-500/50' : 'bg-slate-700/50'}`} />
                                        )}
                                    </div>
                                    <div className={`text-sm py-0.5 ${isCurrent ? 'text-blue-300 font-bold' : isPast ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                                        {step.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {nftExperimentResult && (
                    <div className="bg-slate-800/60 border border-green-900/60 rounded-xl flex flex-col flex-none shadow-lg mt-2">
                        <div className="bg-slate-900/80 border-b border-green-900/50 p-3 text-green-400 font-bold text-sm">
                            NFT 实验结果
                        </div>
                        <div className="p-4 text-xs space-y-2 text-slate-300 font-mono">
                            <div className="flex justify-between"><span className="text-slate-500">NFT编号:</span> <span className="text-white">{nftExperimentResult.nftId}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Token ID:</span> <span className="text-blue-300">{nftExperimentResult.tokenId}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">作者:</span> <span>{nftExperimentResult.author}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">终态所有者:</span> <span className="text-emerald-400">{nftExperimentResult.finalOwner}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">成交价格:</span> <span className="font-bold text-emerald-400">{nftExperimentResult.price}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">交易哈希:</span> <span className="text-[10px] bg-slate-900 px-1 rounded truncate w-24 text-right text-yellow-400">{nftExperimentResult.txHash}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">链上确认:</span> <span className="text-green-500">{nftExperimentResult.onChainStatus}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">完成时间:</span> <span>{nftExperimentResult.time}</span></div>
                            <div className="pt-2 mt-2 border-t border-slate-700 text-slate-400 text-[11px] leading-tight flex items-start gap-1">
                                <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" /> NFT 已完成生成、上架、交易和链上确认流程。
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Column 2: NFT Image & Trade */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-8">
                
                {/* NFT Region */}
                <div className="bg-slate-800/50 border border-blue-900/60 rounded-xl p-5 flex flex-col items-center backdrop-blur shadow-lg relative">
                    <h3 className="font-mono text-xl text-white font-bold mb-4 w-full text-left">{nftId}</h3>
                    
                    <div className="w-full aspect-square bg-slate-900 border-2 border-blue-500/50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        {/* Placeholder Visual for NFT Image */}
                        <div className="w-full h-full relative p-4 flex flex-col items-center justify-center">
                            {/* SVG Fox Placeholder */}
                            <svg viewBox="0 0 100 100" className="w-24 h-24 mb-4 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] filter transition-all duration-300">
                                <polygon points="50,90 10,40 50,20 90,40" fill="#ea580c"/>
                                <polygon points="10,40 25,10 50,20" fill="#f97316"/>
                                <polygon points="90,40 75,10 50,20" fill="#f97316"/>
                                <circle cx="35" cy="50" r="5" fill="#1e293b"/>
                                <circle cx="65" cy="50" r="5" fill="#1e293b"/>
                                <polygon points="50,75 45,65 55,65" fill="#0f172a"/>
                            </svg>
                            
                            <div className="text-[10px] text-blue-200 font-mono w-full px-2 mt-auto grid grid-cols-2 gap-1 text-center bg-slate-800/80 rounded py-1">
                                <div className="truncate text-orange-300">{selectedNftParams.background}</div>
                                <div className="truncate text-yellow-300">{selectedNftParams.hat}</div>
                                <div className="truncate text-purple-300">{selectedNftParams.ornament}</div>
                                <div className="truncate text-cyan-300">{selectedNftParams.glasses}</div>
                                <div className="truncate text-pink-300col-span-2">{selectedNftParams.clothes}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-900/80 rounded-lg border border-blue-800/50 p-3 mb-4 space-y-2 text-sm font-mono flex flex-col">
                        <div className="flex justify-between items-center"><span className="text-slate-500">当前 NFT：</span><span className={nftImageState === '已生成' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{nftImageState}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">NFT 编号：</span><span className="text-white">{nftImageState === '已生成' ? nftId : '待生成'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">Token ID：</span><span className="text-blue-300">{currentNft ? currentNft.tokenId : '待分配'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">链上状态：</span><span className="text-yellow-400">{currentNft ? currentNft.status : '未铸造'}</span></div>
                    </div>

                    <div className="w-full flex items-center justify-between mt-auto gap-4">
                        <div className="text-sm text-blue-300 bg-slate-900/80 px-4 py-2 rounded border border-blue-800 shrink-0">
                            作者：<span className="text-white font-bold">学生1</span>
                        </div>
                        <button 
                            onClick={handleNftGenerate}
                            disabled={nftImageState === '已生成' || nftExperimentMode === "自动"}
                            className="flex-1 py-2 bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_15px_rgba(59,130,246,0.6)] disabled:shadow-none transition-colors"
                        >
                            作者生成NFT
                        </button>
                    </div>
                </div>

                {/* Trade Tab Area */}
                <div className="bg-slate-800/50 border border-blue-900/60 rounded-xl overflow-hidden shadow-lg flex flex-col min-h-[300px]">
                    <div className="flex border-b border-blue-900/60">
                        <button 
                            onClick={() => setNftTradeTab("上架")} 
                            className={`flex-1 py-3 text-center text-sm font-bold ${nftTradeTab === "上架" ? "bg-blue-900/40 text-white border-b-2 border-blue-400" : "text-blue-400 hover:bg-slate-800/80"}`}
                        >
                            上架
                        </button>
                        <button 
                            onClick={() => setNftTradeTab("交易")} 
                            className={`flex-1 py-3 text-center text-sm font-bold ${nftTradeTab === "交易" ? "bg-blue-900/40 text-white border-b-2 border-green-500" : "text-blue-400 hover:bg-slate-800/80"}`}
                        >
                            交易
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                        {nftTradeTab === "上架" ? (
                            <>
                                <div>
                                    <label className="block text-xs text-blue-400 mb-1">用户：</label>
                                    <div className="bg-slate-900 border border-blue-900/50 text-blue-100 rounded px-3 py-2 text-sm font-bold">学生1</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-blue-400 mb-1">NFT：</label>
                                    <select 
                                        value={selectedNftId} 
                                        onChange={e => setSelectedNftId(e.target.value)} 
                                        className="w-full bg-slate-900 border border-blue-900/50 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
                                    >
                                        <option value="">选择 NFT</option>
                                        {nftList.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-blue-400 mb-1">设置价格：</label>
                                    <div className="flex items-center">
                                        <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-l font-bold text-lg leading-none" onClick={() => setNftPrice(p=>Math.max(0, p-1))}>-</button>
                                        <input type="number" className="w-full text-center bg-slate-900 border-y border-blue-900/50 text-white py-2 font-mono text-lg font-bold outline-none" value={nftPrice} onChange={(e)=>setNftPrice(Number(e.target.value) || 0)} />
                                        <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-r font-bold text-lg leading-none" onClick={() => setNftPrice(p=>p+1)}>+</button>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4">
                                    <button 
                                        onClick={handleNftListToMarket}
                                        disabled={nftExperimentMode === "自动"}
                                        className="w-full py-3 bg-emerald-600/90 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-emerald-500 text-white font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none transition-colors"
                                    >
                                        上架NFT市场
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs text-blue-400 mb-1">买家：</label>
                                    <div className="bg-slate-900 border border-blue-900/50 text-emerald-400 rounded px-3 py-2 text-sm font-bold">{selectedBuyer}</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-blue-400 mb-1">NFT：</label>
                                    <select 
                                        value={selectedNftId} 
                                        onChange={e => setSelectedNftId(e.target.value)} 
                                        className="w-full bg-slate-900 border border-blue-900/50 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-mono"
                                    >
                                        <option value="">选择 NFT</option>
                                        {nftMarketList.filter(n => n.status === "已上架").map(n => <option key={n.nftId} value={n.nftId}>{n.nftId}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-blue-400 mb-1">当前价格：</label>
                                        <div className="bg-slate-900 border border-blue-900/50 text-yellow-400 rounded px-3 py-2 text-sm font-bold font-mono">
                                            {selectedNftId ? (nftMarketList.find(n => n.nftId === selectedNftId)?.price || 0) : 0}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-blue-400 mb-1">卖家：</label>
                                        <div className="bg-slate-900 border border-blue-900/50 text-slate-300 rounded px-3 py-2 text-sm">
                                            {selectedNftId ? (nftMarketList.find(n => n.nftId === selectedNftId)?.owner || "-") : "-"}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4">
                                    <button 
                                        onClick={handleNftBuy}
                                        disabled={nftExperimentMode === "自动" || !selectedNftId}
                                        className="w-full py-3 bg-purple-600/90 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-purple-500 text-white font-bold rounded shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:shadow-none transition-colors"
                                    >
                                        购买NFT
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Column 3: Params, Market & Records */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-8">
                
                {/* Parameters */}
                <div className="bg-slate-800/50 border border-blue-900/60 rounded-xl p-5 backdrop-blur shadow-lg flex flex-col shrink-0">
                    <h3 className="font-bold text-white mb-4 border-b border-blue-900/50 pb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-400" /> 参数设置
                    </h3>
                    <div className="space-y-4">
                        {[
                            { key: 'background', label: '背景' },
                            { key: 'hat', label: '帽子' },
                            { key: 'ornament', label: '饰品' },
                            { key: 'glasses', label: '眼镜' },
                            { key: 'clothes', label: '衣服' }
                        ].map(cat => (
                            <div key={cat.key} className="flex flex-col gap-1 text-sm">
                                <div className="text-blue-400 font-medium mb-1">{cat.label}</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(NFT_PARAMS_OPTIONS as any)[cat.key].map((val: string) => (
                                        <div 
                                            key={val}
                                            className={`text-center py-2 rounded text-[11px] truncate px-1 transition-colors border ${
                                                (selectedNftParams as any)[cat.key] === val 
                                                ? "bg-blue-500/20 border-blue-400 text-white font-bold shadow-[inset_0_0_8px_rgba(59,130,246,0.5)]" 
                                                : "bg-slate-900/50 border-slate-700/50 text-slate-400"
                                            }`}
                                        >
                                            {val}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleNftRandomizeParams}
                        disabled={nftExperimentMode === "自动"}
                        className="mt-6 w-full py-2 bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-slate-600 text-white font-bold rounded border border-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> 随机参数
                    </button>
                </div>

                {/* NFT Market */}
                <div className="bg-slate-800/50 border border-blue-900/60 rounded-xl flex flex-col overflow-hidden shadow-lg shrink-0">
                    <h3 className="font-bold text-white p-4 border-b border-blue-900/50 bg-slate-900/70">NFT市场</h3>
                    <div className="w-full">
                        <table className="w-full text-left text-[11px] text-blue-100 table-fixed">
                            <thead className="bg-slate-900 border-b border-blue-900/50 text-blue-400">
                                <tr>
                                    <th className="p-2 w-[35%] font-medium pl-4">NFT编号</th>
                                    <th className="p-2 w-[15%] font-medium">图片</th>
                                    <th className="p-2 w-[20%] font-medium">所有者</th>
                                    <th className="p-2 w-[15%] font-medium">当前价值</th>
                                    <th className="p-2 w-[15%] font-medium text-center">详情</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800/20 divide-y divide-blue-900/30">
                                {nftMarketList.length === 0 ? (
                                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">暂无数据</td></tr>
                                ) : (
                                    nftMarketList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-2 pl-4 truncate font-mono text-white" title={item.nftId}>{item.nftId}</td>
                                            <td className="p-2"><div className="w-6 h-6 bg-slate-900 rounded border border-orange-500/30 flex items-center justify-center text-[8px]">🦊</div></td>
                                            <td className="p-2 truncate">{item.owner}</td>
                                            <td className="p-2 text-yellow-400 font-bold font-mono">{item.price}</td>
                                            <td className="p-2 text-center"><button className="text-blue-400 hover:text-white underline">查看</button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Transaction Records */}
                <div className="bg-slate-800/50 border border-blue-900/60 rounded-xl flex flex-col overflow-hidden shadow-lg shrink-0 min-h-[200px]">
                    <h3 className="font-bold text-white p-4 border-b border-blue-900/50 bg-slate-900/70">交易记录</h3>
                    <div className="w-full overflow-y-auto max-h-48">
                        <table className="w-full text-left text-[10px] text-slate-300">
                            <thead className="bg-slate-900 border-b border-slate-700/50 text-slate-400 sticky top-0">
                                <tr>
                                    <th className="py-1 px-2 font-medium">时间</th>
                                    <th className="py-1 px-2 font-medium">NFT编号</th>
                                    <th className="py-1 px-2 font-medium">卖家/买家</th>
                                    <th className="py-1 px-2 font-medium">成交价</th>
                                    <th className="py-1 px-2 font-medium">交易哈希</th>
                                    <th className="py-1 px-2 font-medium text-center">状态</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {nftTransactionRecords.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center text-slate-600">暂无数据</td></tr>
                                ) : (
                                    nftTransactionRecords.map((rec, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/50">
                                            <td className="py-1.5 px-2 font-mono text-slate-500 whitespace-nowrap">{rec.time}</td>
                                            <td className="py-1.5 px-2 font-mono truncate w-16 text-blue-200" title={rec.nftId}>{rec.nftId.split("#")[1]}</td>
                                            <td className="py-1.5 px-2 whitespace-nowrap">{rec.seller}→<span className="text-emerald-400">{rec.buyer}</span></td>
                                            <td className="py-1.5 px-2 font-bold text-yellow-500">{rec.price}</td>
                                            <td className="py-1.5 px-2 font-mono text-[9px] text-purple-400 truncate w-16" title={rec.txHash}>{rec.txHash}</td>
                                            <td className="py-1.5 px-2 text-center whitespace-nowrap">
                                                <span className="bg-green-900/40 text-green-400 px-1.5 rounded">{rec.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        {/* Reset Confirmation Modal */}
        {nftResetConfirmVisible && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-red-900/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl w-[450px] overflow-hidden">
                    <div className="bg-red-900/30 border-b border-red-900/50 p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 className="text-white font-bold text-lg">重置 NFT 实验确认</h3>
                    </div>
                    <div className="p-6 text-slate-300 text-sm space-y-4">
                        <p className="text-red-300 mb-2">重置后将清空本轮 NFT 参数、已生成 NFT、市场上架数据、交易记录和当前步骤状态，恢复到初始状态，可重新进行 NFT 实验练习。</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                <div className="text-slate-500 font-bold mb-2 text-xs">清空内容：</div>
                                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs">
                                    <li>当前 NFT 参数与编号</li>
                                    <li>已生成 NFT 数据</li>
                                    <li>NFT 市场数据</li>
                                    <li>上架状态与交易状态</li>
                                    <li>当前交易记录</li>
                                    <li>当前实验步骤及输出</li>
                                </ul>
                            </div>
                            <div className="bg-blue-950/20 p-3 rounded border border-blue-900/30">
                                <div className="text-slate-500 font-bold mb-2 text-xs">保留内容：</div>
                                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs">
                                    <li>实验说明与参数选项</li>
                                    <li>历史操作日志</li>
                                    <li>重置记录</li>
                                    <li>收藏实验记录</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                        <button 
                            className="px-5 py-2 rounded text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                            onClick={() => setNftResetConfirmVisible(false)}
                        >
                            取消
                        </button>
                        <button 
                            className="px-5 py-2 rounded text-sm font-bold bg-red-700 hover:bg-red-600 text-white transition-colors shadow-lg"
                            onClick={handleNftReset}
                        >
                            确认重置
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const renderRightFunctionBar = () => {
    return (
      <div className="w-12 bg-slate-900 border-l border-blue-900/50 flex flex-col items-center py-4 shrink-0 shadow-[-2px_0_10px_rgba(0,0,0,0.2)] z-20 gap-2">
        <button className="flex flex-col items-center justify-center h-28 w-10 text-blue-400 hover:text-blue-200 transition-colors bg-slate-800/30 hover:bg-slate-800 rounded">
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest">任务实施</span>
        </button>
        <button className="flex flex-col items-center justify-center h-28 w-10 text-blue-400 hover:text-blue-200 transition-colors bg-slate-800/30 hover:bg-slate-800 rounded">
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest">知识储备</span>
        </button>
        <button className="flex flex-col items-center justify-center h-28 w-10 text-white bg-blue-900/50 rounded shadow-[inset_0_0_10px_rgba(59,130,246,0.3)] border border-blue-500/30">
           <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest">{currentTopMenu === "NFT实验" ? "NFT实验" : "实验说明"}</span>
        </button>
        <button 
           onClick={() => {
              if (blockchainPageMode === "home") {
                 setShowFavoritePanel(!showFavoritePanel);
              } else {
                 handleFavoriteClick();
                 setShowFavoritePanel(true);
              }
           }}
           className={`flex flex-col items-center justify-center h-28 w-10 transition-colors rounded ${showFavoritePanel ? 'text-yellow-100 bg-yellow-600/50 border border-yellow-500/30 shadow-[0_0_10px_rgba(202,138,4,0.3)]' : 'text-yellow-400 hover:text-yellow-200 bg-slate-800/30 hover:bg-slate-800'}`}
        >
           <Star className={`w-4 h-4 mb-2 ${showFavoritePanel ? 'fill-yellow-100' : 'fill-yellow-600/30'}`} />
           <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-wide">收藏</span>
        </button>
      </div>
    );
  };

  const renderPlaceholderExperiment = () => {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a1120] relative p-6 text-blue-100">
        <div className="absolute inset-0 pattern-dots pointer-events-none opacity-50" style={{ backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px)' }} />
        <div className="text-center z-10">
          <Hexagon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-400 mb-2">{currentTopMenu}</h2>
          <p className="text-slate-500 mb-6">该实验的操作界面正在建设中，请优先体验「梅克尔树实验」或「NFT实验」。</p>
          <button 
            onClick={() => {
              setCurrentTopMenu("主页");
              setBlockchainPageMode("home");
            }}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold text-sm transition-all mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> 返回主页
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col font-sans bg-[#0B1120] ${isFullscreen ? "fixed inset-0 z-[100]" : "h-full w-full"}`}>
      {renderTopEnvironmentBar()}
      <div className="flex flex-1 min-h-0 relative">
        {blockchainPageMode === "home" && renderFarLeftNav()}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          {renderSubHeader()}
          <div className="flex flex-1 min-h-0 relative">
            {blockchainPageMode === "home" && renderLeftMenu()}
            {blockchainPageMode === "home" ? renderHexagons() : currentTopMenu === "梅克尔树实验" ? renderMerkleExperiment() : currentTopMenu === "NFT实验" ? renderNFTExperiment() : renderPlaceholderExperiment()}
            
            {/* Overlay Favorite Panel */}
            {showFavoritePanel && (
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-blue-800 shadow-[-5px_0_15px_rgba(0,0,0,0.5)] z-50 flex flex-col text-blue-100 animate-in slide-in-from-right-4 duration-200">
                <div className="p-4 border-b border-blue-900/50 flex justify-between items-center bg-blue-900/20">
                  <div className="font-bold flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    收藏实验
                  </div>
                  <button onClick={() => setShowFavoritePanel(false)} className="text-blue-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 text-xs text-blue-300 bg-slate-800/30">可用列表快速打开已收藏的实验，恢复上次操作状态。</div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {favoriteExperiments.map(fav => (
                    <div key={fav.id} className="bg-slate-800/50 border border-blue-900/50 rounded-lg p-3 hover:border-blue-500/50 transition-colors">
                      <div className="font-bold text-sm text-white">{fav.name}</div>
                      <div className="text-xs text-blue-400 mt-1">所属章节：{fav.chapter}</div>
                      <div className="text-xs text-blue-400 mt-1">收藏时间：{fav.favoriteTime}</div>
                      <div className="text-xs mt-1 text-emerald-400 font-medium">状态：{fav.status}</div>
                      <div className="flex justify-end gap-2 mt-3 border-t border-blue-900/50 pt-2">
                        <button onClick={() => handleUnfavorite(fav.id, fav.name)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-900/20 rounded">取消收藏</button>
                        <button onClick={() => handleRestoreFavorite(fav)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-medium shadow-[0_0_8px_rgba(37,99,235,0.4)]">打开实验</button>
                      </div>
                    </div>
                  ))}
                  {favoriteExperiments.length === 0 && (
                    <div className="text-center py-10 text-blue-500/50 text-sm">暂无收藏实验</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Logs Area (for home) */}
          {blockchainPageMode === "home" && (
            <div className="h-32 bg-slate-900 border-t border-blue-900/60 shrink-0 flex flex-col z-10">
               <div className="h-8 bg-blue-900/30 border-b border-blue-900/50 flex items-center px-4 gap-2 text-xs font-bold text-blue-300">
                 <FileText className="w-3 h-3" /> 操作日志
               </div>
               <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] text-blue-200 flex flex-col-reverse">
                  {operationLogs.slice(-20).reverse().map((log, idx) => (
                    <div key={idx} className="flex gap-4 py-1 hover:bg-slate-800/50 px-2 rounded -mx-2 items-center">
                      <span className="text-slate-500 w-16 shrink-0">{log.time}</span>
                      <span className="text-slate-300 w-32 shrink-0 truncate">{log.experiment}</span>
                      <span className="text-indigo-300 w-12 shrink-0">{log.mode}</span>
                      <span className="text-slate-400 w-16 shrink-0 truncate">{log.step}</span>
                      <span className="text-blue-400 w-24 shrink-0">{log.type}</span>
                      <span className="flex-1 truncate">{log.content}</span>
                      <span className="text-emerald-500 w-12 text-right shrink-0">{log.result}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
        {renderRightFunctionBar()}
      </div>
    </div>
  );
}
