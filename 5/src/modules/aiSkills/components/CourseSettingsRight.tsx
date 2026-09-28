import { CourseConfig } from '../data';
import { Monitor, BarChart, LineChart as LineChartIcon, Map as RadarIcon, PieChart, Activity, User, BookOpen, CheckCircle } from 'lucide-react';

interface CourseSettingsRightProps {
  courseConfig: CourseConfig | null;
  onUpdate: (updated: CourseConfig) => void;
}

export default function CourseSettingsRight({ courseConfig, onUpdate }: CourseSettingsRightProps) {
  if (!courseConfig) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-6 text-gray-400">
        请选择课程查看图表配置
      </div>
    );
  }

  const handleToggleDisplayTarget = (target: string) => {
    const isSelected = courseConfig.displayTargets.includes(target);
    const newTargets = isSelected ? courseConfig.displayTargets.filter(t => t !== target) : [...courseConfig.displayTargets, target];
    onUpdate({ ...courseConfig, displayTargets: newTargets });
  };

  const handleToggleDisplayPosition = (pos: string) => {
    const isSelected = courseConfig.displayPositions.includes(pos);
    const newPositions = isSelected ? courseConfig.displayPositions.filter(p => p !== pos) : [...courseConfig.displayPositions, pos];
    onUpdate({ ...courseConfig, displayPositions: newPositions });
  };

  const handleToggleChart = (chart: string) => {
    const isSelected = courseConfig.chartSettings.includes(chart);
    const newCharts = isSelected ? courseConfig.chartSettings.filter(c => c !== chart) : [...courseConfig.chartSettings, chart];
    onUpdate({ ...courseConfig, chartSettings: newCharts });
  };

  const allTargets = ['学生', '教师', '课程管理员'];
  const allPositions = ['课程首页', 'AI技能助手首页', '学生学习空间', '教师课程空间'];
  const allCharts = ['技能掌握度图表', '学习进度图表', '实验完成率图表', '问答活跃度图表', '知识点薄弱项图表', 'AI应用调用统计图表'];

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-y-auto">
      
      {/* 1. 大模型展示配置 */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-emerald-500 pl-2 mb-4">大模型展示配置</h2>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-900">是否在大模型中展示</span>
            <button 
              type="button" 
              onClick={() => onUpdate({ ...courseConfig, showInLargeModel: !courseConfig.showInLargeModel })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${courseConfig.showInLargeModel ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${courseConfig.showInLargeModel ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-4">当前状态: <span className={`font-bold ${courseConfig.showInLargeModel ? 'text-blue-600' : 'text-gray-400'}`}>{courseConfig.showInLargeModel ? '展示' : '不展示'}</span></div>
          
          <div className={`space-y-4 transition-opacity duration-300 ${!courseConfig.showInLargeModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="text-xs text-gray-500 block mb-1">展示名称</label>
              <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded">{courseConfig.courseName} AI 技能助手</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">展示说明</label>
              <div className="text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded">为 {courseConfig.courseName} 提供课程答疑、实验指导、代码解释和技能提升建议。</div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 block mb-2">展示位置设置</label>
              <div className="flex flex-wrap gap-2">
                {allPositions.map(pos => (
                  <button key={pos} onClick={() => handleToggleDisplayPosition(pos)} className={`text-xs px-2.5 py-1 rounded border transition-colors ${courseConfig.displayPositions.includes(pos) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {courseConfig.displayPositions.includes(pos) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 block mb-2">展示对象设置</label>
              <div className="flex flex-wrap gap-2">
                {allTargets.map(target => (
                  <button key={target} onClick={() => handleToggleDisplayTarget(target)} className={`text-xs px-2.5 py-1 rounded border transition-colors ${courseConfig.displayTargets.includes(target) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {courseConfig.displayTargets.includes(target) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {target}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. 展示图表设置 */}
      <div className={`p-5 border-b border-gray-200 transition-opacity duration-300 ${!courseConfig.showInLargeModel ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-500 pl-2 mb-4">展示图表设置</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-3">支持配置课程在大模型中展示的图表内容，默认将以卡片图、柱状图、折线图等方式渲染。</p>
          <div className="grid grid-cols-2 gap-3">
            {allCharts.map(chart => (
              <div key={chart} className="flex flex-col border border-gray-100 rounded p-2 hover:bg-gray-50">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[11px] font-bold text-gray-700">{chart}</span>
                   <button 
                     onClick={() => handleToggleChart(chart)}
                     className={`w-8 h-4 rounded-full relative transition-colors ${courseConfig.chartSettings.includes(chart) ? 'bg-emerald-500' : 'bg-gray-300'}`}
                   >
                     <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${courseConfig.chartSettings.includes(chart) ? 'translate-x-4' : 'translate-x-0'}`}></span>
                   </button>
                 </div>
                 <div className="text-[10px] text-gray-400">
                    {chart.includes('掌握') ? '雷达图' : chart.includes('进度') ? '折线图' : chart.includes('完成') ? '柱状图' : chart.includes('统计') ? '柱状图' : '卡片图'}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 大模型展示预览 */}
      <div className={`p-5 flex-1 transition-opacity duration-300 ${!courseConfig.showInLargeModel ? 'opacity-50 pointer-events-none' : ''}`}>
         <h2 className="text-base font-bold text-gray-900 border-l-4 border-purple-500 pl-2 mb-4">大模型展示预览</h2>
         <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                 <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-gray-900">{courseConfig.courseName}</h3>
                 <div className="text-[10px] text-gray-500 mt-0.5">默认：{courseConfig.defaultAiApp || '暂未设置'} • 关联 {courseConfig.linkedAiApps.length} 个应用</div>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                已展示
              </div>
            </div>

            {/* Simulated Charts grid */}
            <div className="grid grid-cols-2 gap-4">
              {courseConfig.chartSettings.includes('技能掌握度图表') && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 h-28 flex flex-col items-center justify-center relative">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 flex items-center gap-1"><RadarIcon className="w-3 h-3"/> 技能掌握度</div>
                  <div className="w-16 h-16 border-2 border-dashed border-emerald-300 rounded-full flex items-center justify-center mt-3">
                    <span className="text-xs font-bold text-emerald-700">86%</span>
                  </div>
                </div>
              )}
              {courseConfig.chartSettings.includes('学习进度图表') && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 h-28 flex flex-col relative">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 flex items-center gap-1"><LineChartIcon className="w-3 h-3"/> 学习进度</div>
                  <div className="flex-1 flex items-end gap-1 px-2 pt-6">
                     <div className="w-full bg-blue-100 rounded-t h-[40%]"></div>
                     <div className="w-full bg-blue-200 rounded-t h-[60%]"></div>
                     <div className="w-full bg-blue-300 rounded-t h-[50%]"></div>
                     <div className="w-full bg-blue-400 rounded-t h-[76%]"></div>
                  </div>
                  <div className="text-center text-[10px] text-gray-500 mt-1">综合完成率 76%</div>
                </div>
              )}
              {courseConfig.chartSettings.includes('实验完成率图表') && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 h-28 flex flex-col justify-center relative">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 flex items-center gap-1"><BarChart className="w-3 h-3"/> 实验完成率</div>
                  <div className="mt-4 px-2">
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">已完成 12/18</span><span className="text-emerald-600 font-bold">66%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {courseConfig.chartSettings.includes('问答活跃度图表') && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 h-28 flex flex-col items-center justify-center relative">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 flex items-center gap-1"><Activity className="w-3 h-3"/> 问答活跃度</div>
                  <div className="flex items-end mt-4">
                     <span className="text-2xl font-bold text-orange-600">34</span>
                     <span className="text-[10px] text-gray-500 ml-1 mb-1">次 / 周</span>
                  </div>
                </div>
              )}
              {courseConfig.chartSettings.includes('知识点薄弱项图表') && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 h-28 flex flex-col relative col-span-2">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 flex items-center gap-1"><PieChart className="w-3 h-3"/> 薄弱知识点</div>
                  <div className="flex flex-wrap gap-1.5 mt-6 px-1">
                     <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">pyecharts</span>
                     <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded border border-orange-100">文件读写</span>
                     <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] rounded border border-yellow-100">pandas基础</span>
                  </div>
                </div>
              )}
            </div>

            {courseConfig.chartSettings.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-xs">暂无启用的图表展示数据</div>
            )}
         </div>
      </div>

    </div>
  );
}
