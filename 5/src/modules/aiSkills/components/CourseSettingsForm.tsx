import { CourseConfig } from '../data';
import { BookOpen, FileText, CheckCircle, Database } from 'lucide-react';

interface CourseSettingsFormProps {
  courseConfig: CourseConfig | null;
  onUpdate: (updated: CourseConfig) => void;
}

export default function CourseSettingsForm({ courseConfig, onUpdate }: CourseSettingsFormProps) {
  if (!courseConfig) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
        <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
        <p>请在左侧列表中选择一门课程</p>
      </div>
    );
  }

  const allAvailableApps = [
    { name: "Python课程答疑助手", type: "课程教学", status: "已发布" },
    { name: "Python实验指导助手", type: "实验指导", status: "已发布" },
    { name: "期末复习训练助手", type: "考试训练", status: "已发布" },
    { name: "作业智能批改助手", type: "作业批改", status: "草稿" },
    { name: "区块链实验指导助手", type: "实验指导", status: "已发布" },
    { name: "智能合约答疑助手", type: "课程教学", status: "已发布" },
    { name: "链上数据分析助手", type: "数据分析", status: "草稿" },
    { name: "物联网硬件实验助手", type: "实验指导", status: "已发布" },
    { name: "设备故障排查助手", type: "技能诊断", status: "已发布" },
    { name: "实验报告生成助手", type: "作业批改", status: "草稿" },
    { name: "大数据分析助手", type: "数据分析", status: "已发布" },
    { name: "数据处理问答助手", type: "课程教学", status: "草稿" },
    { name: "数据可视化学习助手", type: "学习辅导", status: "已发布" },
    { name: "图表配置答疑助手", type: "课程教学", status: "已发布" },
    { name: "AI基础学习助手", type: "学习辅导", status: "已发布" },
    { name: "嵌入式实验助手", type: "实验指导", status: "已发布" },
    { name: "串口通信答疑助手", type: "课程教学", status: "已发布" },
    { name: "软件项目指导助手", type: "实验指导", status: "已发布" }
  ];

  // Dummy mock logic to get related apps for given course courseType / courseName
  const availableApps = allAvailableApps.filter(app => {
    if (courseConfig.courseType === '编程开发' && app.name.includes('Python')) return true;
    if (courseConfig.courseType === '编程开发' && app.name.includes('软件')) return true;
    if (courseConfig.courseType === '区块链' && app.name.includes('链')) return true;
    if (courseConfig.courseType === '物联网' && (app.name.includes('设备') || app.name.includes('实验报告') || app.name.includes('串口') || app.name.includes('软硬') || app.name.includes('联网'))) return true;
    if (courseConfig.courseType === '数据分析' && (app.name.includes('数据') || app.name.includes('图表'))) return true;
    if (courseConfig.courseType === '人工智能' && app.name.includes('AI')) return true;
    return courseConfig.linkedAiApps.includes(app.name);
  });

  const availableCapabilities = [
    "课程知识问答", "实验步骤指导", "代码错误解释", "学习路径推荐", "技能掌握分析", "考试复习建议", "作业批改辅助"
  ];

  const handleToggleApp = (appName: string) => {
    const isLinked = courseConfig.linkedAiApps.includes(appName);
    let newLinked = isLinked 
      ? courseConfig.linkedAiApps.filter(n => n !== appName)
      : [...courseConfig.linkedAiApps, appName];
    
    let newDefault = courseConfig.defaultAiApp;
    if (isLinked && newDefault === appName) {
      newDefault = newLinked.length > 0 ? newLinked[0] : '';
    } else if (!isLinked && newLinked.length === 1) {
      newDefault = appName;
    }
    
    onUpdate({ ...courseConfig, linkedAiApps: newLinked, defaultAiApp: newDefault });
  };

  const handleToggleCapability = (cap: string) => {
    const isEnabled = courseConfig.aiCapabilities.includes(cap);
    const newCaps = isEnabled 
      ? courseConfig.aiCapabilities.filter(c => c !== cap)
      : [...courseConfig.aiCapabilities, cap];
    onUpdate({ ...courseConfig, aiCapabilities: newCaps });
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto w-full p-6">
      <h2 className="text-lg font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-6">AI技能助手设置</h2>
      
      {/* Course Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600"/> 课程基础信息</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div className="flex"><span className="text-gray-500 w-20 shrink-0">课程名称：</span><span className="font-bold text-gray-900">{courseConfig.courseName}</span></div>
          <div className="flex"><span className="text-gray-500 w-20 shrink-0">课程类型：</span><span className="text-gray-900">{courseConfig.courseType}</span></div>
          <div className="flex"><span className="text-gray-500 w-20 shrink-0">授课对象：</span><span className="text-gray-900">信息工程学院 / {courseConfig.icon}基础班</span></div>
          <div className="flex"><span className="text-gray-500 w-20 shrink-0">课程概述：</span><span className="text-gray-700 line-clamp-1" title={courseConfig.overview}>{courseConfig.overview}</span></div>
          <div className="col-span-2 border-t border-gray-200 my-1"></div>
          <div className="flex"><span className="text-gray-500 w-24 shrink-0">课程知识库：</span><span className="text-emerald-700 font-medium flex items-center gap-1"><Database className="w-3.5 h-3.5"/> {courseConfig.kbName}</span></div>
          <div className="flex gap-6">
            <div className="flex"><span className="text-gray-500 mr-2">知识库文档：</span><span className="font-bold text-gray-900">{courseConfig.kbDocCount} 个</span></div>
            <div className="flex"><span className="text-gray-500 mr-2">知识库字数：</span><span className="font-bold text-emerald-600">{courseConfig.kbWordCount} 万字</span></div>
          </div>
        </div>
      </div>

      {/* Settings Section 1: Enable AI Assistant */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-900">启用 AI 技能助手</label>
          <button 
            type="button" 
            onClick={() => onUpdate({ ...courseConfig, aiAssistantEnabled: !courseConfig.aiAssistantEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${courseConfig.aiAssistantEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${courseConfig.aiAssistantEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-xs text-gray-500">开启后，该课程可使用 AI 技能助手进行课程答疑、实验指导、技能分析和学习路径推荐。</p>
      </div>

      <div className={`transition-opacity duration-300 ${!courseConfig.aiAssistantEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Settings Section 2: Link AI Apps */}
        <div className="mb-8">
          <label className="text-sm font-bold text-gray-900 mb-3 block">关联大模型 AI 应用</label>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {availableApps.map((app, idx) => {
              const isLinked = courseConfig.linkedAiApps.includes(app.name);
              return (
                <div 
                  key={idx}
                  onClick={() => handleToggleApp(app.name)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isLinked ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-sm ${isLinked ? 'text-emerald-800' : 'text-gray-800'}`}>{app.name}</h4>
                    {isLinked && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">应用类型：{app.type}</span>
                    <span className={`${app.status === '已发布' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} px-1.5 py-0.5 rounded`}>状态：{app.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings Section 3: Default AI App */}
        <div className="mb-8">
          <label className="text-sm font-bold text-gray-900 mb-2 block">默认 AI 应用</label>
          <select 
            value={courseConfig.defaultAiApp}
            onChange={(e) => onUpdate({ ...courseConfig, defaultAiApp: e.target.value })}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
            disabled={courseConfig.linkedAiApps.length === 0}
          >
            {courseConfig.linkedAiApps.length > 0 ? (
              courseConfig.linkedAiApps.map(app => (
                <option key={app} value={app}>{app}</option>
              ))
            ) : (
              <option value="">暂无关联应用</option>
            )}
          </select>
        </div>

        {/* Settings Section 4: AI Capabilities Range */}
        <div className="mb-4">
          <label className="text-sm font-bold text-gray-900 mb-3 block">AI 技能助手能力范围</label>
          <div className="flex flex-wrap gap-2">
            {availableCapabilities.map(cap => {
              const isEnabled = courseConfig.aiCapabilities.includes(cap);
              return (
                <button
                  key={cap}
                  onClick={() => handleToggleCapability(cap)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isEnabled ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
