import { useState, useMemo, useEffect } from 'react';
import { initialAiAppList, initialQueryRecords, initialKbList, initialKbRecords, AiApp, QueryRecord, KnowledgeBase, KbRecord, initialCourseConfigs, initialCourseRecords, CourseConfig, CourseConfigRecord } from './data';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import AppList from './components/AppList';
import RightPanel from './components/RightPanel';
import KnowledgeBaseList from './components/KnowledgeBaseList';
import KbRightPanel from './components/KbRightPanel';
import KbOperationRecords from './components/KbOperationRecords';
import CourseSettingsList from './components/CourseSettingsList';
import CourseSettingsForm from './components/CourseSettingsForm';
import CourseSettingsRight from './components/CourseSettingsRight';
import CourseSettingsRecords from './components/CourseSettingsRecords';
import Toast from './components/Toast';

export default function AiSkillsModule() {
  const [activeMenu, setActiveMenu] = useState('知识库管理');
  
  // -- App State --
  const [aiAppList, setAiAppList] = useState<AiApp[]>(initialAiAppList);
  const [selectedAiAppId, setSelectedAiAppId] = useState<string | null>(initialAiAppList[0]?.id || null);
  const [createMode, setCreateMode] = useState<'none' | 'select' | 'dialog' | 'info'>('none');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [selectedSceneCategory, setSelectedSceneCategory] = useState('全部场景');
  const [selectedToolType, setSelectedToolType] = useState('全部类型');
  
  // -- KB State --
  const [kbList, setKbList] = useState<KnowledgeBase[]>(initialKbList);
  const [selectedKbId, setSelectedKbId] = useState<string | null>(initialKbList[0]?.id || null);
  const [selectedCourseType, setSelectedCourseType] = useState('全部类型');
  const [selectedKbStatus, setSelectedKbStatus] = useState('全部状态');
  const [kbRecords, setKbRecords] = useState<KbRecord[]>(initialKbRecords);

  // -- Course Settings State --
  const [courseConfigs, setCourseConfigs] = useState<CourseConfig[]>(initialCourseConfigs);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseConfigs[0]?.id || null);
  const [selectedCourseStatus, setSelectedCourseStatus] = useState('全部');
  const [courseRecords, setCourseRecords] = useState<CourseConfigRecord[]>(initialCourseRecords);
  
  // -- Shared State --
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addKbRecord = (action: string, courseName: string, docCount: number, wc: string, appCount: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newRecord: KbRecord = {
      time: timeStr,
      action,
      courseName,
      documentCount: `${docCount}个`,
      wordCount: wc,
      managedAppCount: `${appCount}个`,
      operator: '教师1',
      result: '成功'
    };
    setKbRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteApp = (app: AiApp) => {
    if (window.confirm('确认删除该 AI 应用？删除后将不再显示在应用列表中。')) {
      setAiAppList(prev => prev.filter(a => a.id !== app.id));
      if (selectedAiAppId === app.id) {
        setSelectedAiAppId(aiAppList.find(a => a.id !== app.id)?.id || null);
      }
      showToast('AI应用已删除');
    }
  };

  const handleEditApp = (app: AiApp) => {
    setEditingAppId(app.id);
    setCreateMode('none');
    setSelectedAiAppId(app.id);
  };

  const handleSaveApp = (newApp: AiApp) => {
    if (editingAppId) {
      setAiAppList(prev => prev.map(a => a.id === editingAppId ? newApp : a));
      setEditingAppId(null);
      showToast('AI应用修改已保存');
    } else {
      setAiAppList(prev => [newApp, ...prev]);
      setCreateMode('none');
      setSelectedAiAppId(newApp.id);
      showToast('AI应用创建成功');
    }
  };

  const handleSaveCourseConfig = () => {
    const config = courseConfigs.find(c => c.id === selectedCourseId);
    if (!config) return;
    
    // Create operation record
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newRecord: CourseConfigRecord = {
      time: timeStr,
      courseName: config.courseName,
      action: config.aiAssistantEnabled ? '更新AI助手设置' : '停用AI技能助手',
      linkedApps: `${config.linkedAiApps.length}个应用`,
      displayStatus: config.showInLargeModel ? '展示' : '不展示',
      chartSetting: `${config.chartSettings.length}项图表`,
      operator: '教师1',
      result: '成功'
    };
    
    setCourseRecords(prev => [newRecord, ...prev]);
    showToast('课程 AI 技能助手配置已保存');
  };

  const handleSearch = () => {
    setSearchKeyword(inputValue);
    if (activeMenu === '知识库管理') {
        const count = kbList.filter(kb => {
          let matched = (selectedCourseType === '全部类型' || kb.courseType === selectedCourseType) &&
                        (selectedKbStatus === '全部状态' || kb.status === selectedKbStatus) &&
                        (!inputValue || kb.courseName.includes(inputValue) || kb.overview.includes(inputValue));
          return matched;
        }).length;
        addKbRecord("组合查询", inputValue || "所有课程", 0, "0", count);
        showToast('知识库列表已筛选');
    } else if (activeMenu === '课程AI助手设置') {
        showToast('课程列表已筛选');
    }
  };

  const handleResetFilters = () => {
    setInputValue('');
    setSearchKeyword('');
    setSelectedSceneCategory('全部场景');
    setSelectedToolType('全部类型');
    setSelectedCourseType('全部类型');
    setSelectedKbStatus('全部状态');
    if (activeMenu === '知识库管理') {
        addKbRecord("重置筛选", "所有课程", 0, "0", kbList.length);
    }
  };

  const filteredApps = useMemo(() => {
    return aiAppList.filter(app => {
      let sceneMatch = selectedSceneCategory === '全部场景' || app.scene === selectedSceneCategory;
      let toolMatch = selectedToolType === '全部类型' || app.toolType === selectedToolType;
      
      let keywordMatch = true;
      if (searchKeyword.trim() !== '') {
        const lowerKeyword = searchKeyword.toLowerCase();
        keywordMatch = 
          app.name.toLowerCase().includes(lowerKeyword) ||
          app.scene.toLowerCase().includes(lowerKeyword) ||
          app.toolType.toLowerCase().includes(lowerKeyword) ||
          app.course.toLowerCase().includes(lowerKeyword) ||
          app.description.toLowerCase().includes(lowerKeyword) ||
          app.knowledgeBases.some(kb => kb.toLowerCase().includes(lowerKeyword)) ||
          app.createMode.toLowerCase().includes(lowerKeyword) ||
          app.status.toLowerCase().includes(lowerKeyword);
      }
      return sceneMatch && toolMatch && keywordMatch;
    });
  }, [aiAppList, selectedSceneCategory, selectedToolType, searchKeyword]);

  const filteredKbs = useMemo(() => {
    return kbList.filter(kb => {
      let catMatch = selectedCourseType === '全部类型' || kb.courseType === selectedCourseType;
      let statusMatch = selectedKbStatus === '全部状态' || kb.status === selectedKbStatus;
      let keywordMatch = true;
      if (searchKeyword.trim() !== '') {
        const lowerKeyword = searchKeyword.toLowerCase();
        keywordMatch = 
          kb.courseName.toLowerCase().includes(lowerKeyword) ||
          kb.overview.toLowerCase().includes(lowerKeyword) ||
          kb.managedApps.some(app => app.toLowerCase().includes(lowerKeyword)) ||
          kb.status.toLowerCase().includes(lowerKeyword);
      }
      return catMatch && statusMatch && keywordMatch;
    });
  }, [kbList, selectedCourseType, selectedKbStatus, searchKeyword]);

  const filteredCourses = useMemo(() => {
    return courseConfigs.filter(cfg => {
      let statusMatch = true;
      if (selectedCourseStatus === '已启用') statusMatch = cfg.aiAssistantEnabled;
      if (selectedCourseStatus === '未启用' || selectedCourseStatus === '待配置') statusMatch = !cfg.aiAssistantEnabled;
      
      let keywordMatch = true;
      if (searchKeyword.trim() !== '') {
        const lowerKeyword = searchKeyword.toLowerCase();
        keywordMatch = 
          cfg.courseName.toLowerCase().includes(lowerKeyword) ||
          cfg.linkedAiApps.some(app => app.toLowerCase().includes(lowerKeyword));
      }
      
      return statusMatch && keywordMatch;
    });
  }, [courseConfigs, selectedCourseStatus, searchKeyword]);


  useEffect(() => {
    if (activeMenu === '知识库管理') {
        if (filteredKbs.length > 0 && !filteredKbs.some(k => k.id === selectedKbId)) {
            setSelectedKbId(filteredKbs[0].id);
        } else if (filteredKbs.length === 0) {
            setSelectedKbId(null);
        }
    } else {
        if (filteredApps.length > 0 && !filteredApps.some(a => a.id === selectedAiAppId)) {
            setSelectedAiAppId(filteredApps[0].id);
        } else if (filteredApps.length === 0) {
            setSelectedAiAppId(null);
        }
    }
  }, [filteredKbs, filteredApps, activeMenu]);

  const selectedApp = useMemo(() => aiAppList.find(a => a.id === selectedAiAppId) || null, [aiAppList, selectedAiAppId]);
  const selectedKb = useMemo(() => kbList.find(k => k.id === selectedKbId) || null, [kbList, selectedKbId]);
  const selectedCourseConfig = useMemo(() => courseConfigs.find(c => c.id === selectedCourseId) || null, [courseConfigs, selectedCourseId]);

  const courseStats = useMemo(() => {
    return {
      total: courseConfigs.length,
      enabled: courseConfigs.filter(c => c.aiAssistantEnabled).length,
      linkedApps: courseConfigs.reduce((acc, c) => acc + c.linkedAiApps.length, 0),
      charted: courseConfigs.filter(c => c.chartSettings.length > 0).length
    };
  }, [courseConfigs]);

  const handleUpdateCourseConfig = (updated: CourseConfig) => {
    setCourseConfigs(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <Header 
        activeMenu={activeMenu}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        onCreateSelect={() => { setCreateMode('select'); setEditingAppId(null); }}
        searchKeyword={searchKeyword}
        resultCount={activeMenu === '知识库管理' ? filteredKbs.length : activeMenu === '课程AI助手设置' ? filteredCourses.length : filteredApps.length}
        onSaveCourseConfig={handleSaveCourseConfig}
        courseStats={courseStats}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          activeMenu={activeMenu}
          setActiveMenu={(m) => {
             setActiveMenu(m);
             setInputValue('');
             setSearchKeyword('');
          }}
          kbList={kbList}
          selectedCourseType={selectedCourseType}
          onSelectCourseType={(c) => {
             setSelectedCourseType(c);
             addKbRecord("筛选课程类型", c, 0, "0", kbList.filter(k => k.courseType === c || c === '全部类型').length);
             showToast('知识库列表已筛选');
          }}
          aiAppList={aiAppList}
          selectedSceneCategory={selectedSceneCategory}
          onSelectSceneCategory={(scene) => {
            setSelectedSceneCategory(scene);
          }}
          onCreateSelect={() => { setCreateMode('select'); setEditingAppId(null); }}
        />

        <main className="flex-1 flex overflow-hidden">
          {activeMenu === '课程AI助手设置' ? (
             <div className="flex flex-1 flex-col overflow-hidden relative">
               <div className="flex flex-1 overflow-hidden">
                 <CourseSettingsList 
                   courses={filteredCourses}
                   selectedId={selectedCourseId}
                   onSelect={setSelectedCourseId}
                   searchKeyword={searchKeyword}
                   selectedStatus={selectedCourseStatus}
                   onSelectStatus={setSelectedCourseStatus}
                 />
                 <CourseSettingsForm 
                   courseConfig={selectedCourseConfig}
                   onUpdate={handleUpdateCourseConfig}
                 />
                 <div className="w-[380px] shrink-0 border-l border-gray-200">
                   <CourseSettingsRight 
                     courseConfig={selectedCourseConfig}
                     onUpdate={handleUpdateCourseConfig}
                   />
                 </div>
               </div>
               <CourseSettingsRecords records={courseRecords} />
             </div>
          ) : activeMenu === '知识库管理' ? (
             <>
               <div className="flex-1 p-4 overflow-y-auto border-r border-gray-200 bg-white flex flex-col">
                 <KnowledgeBaseList 
                   kbs={filteredKbs}
                   selectedId={selectedKbId}
                   onSelect={(id) => {
                      setSelectedKbId(id);
                      const kb = kbList.find(k => k.id === id);
                      if (kb) addKbRecord("查看知识库", kb.courseName, kb.documentCount, kb.wordCount, kb.managedAppCount);
                   }}
                   searchKeyword={searchKeyword}
                 />
               </div>
               <div className="w-[450px] bg-gray-50 border-l border-gray-200 flex flex-col z-10 shadow-sm relative overflow-y-auto">
                 <KbRightPanel selectedKb={selectedKb} />
               </div>
             </>
          ) : (
             <>
               <div className="flex-1 p-4 overflow-y-auto border-r border-gray-200 bg-white flex flex-col">
                 <AppList 
                   apps={filteredApps} 
                   aiAppList={aiAppList}
                   selectedId={selectedAiAppId}
                   selectedToolType={selectedToolType}
                   onSelectToolType={setSelectedToolType}
                   searchKeyword={searchKeyword}
                   selectedSceneCategory={selectedSceneCategory}
                   onClearScene={() => setSelectedSceneCategory('全部场景')}
                   onClearToolType={() => setSelectedToolType('全部类型')}
                   onClearKeyword={() => { setSearchKeyword(''); setInputValue(''); }}
                   onClearAll={handleResetFilters}
                   onSelect={(id) => {
                     setSelectedAiAppId(id);
                     setCreateMode('none');
                   }}
                   onEdit={handleEditApp}
                   onDelete={handleDeleteApp}
                   onCreateApp={() => { setCreateMode('select'); setEditingAppId(null); }}
                 />
               </div>

               <div className="w-[450px] bg-gray-50 border-l border-gray-200 flex flex-col z-10 shadow-sm relative overflow-y-auto">
                 <RightPanel 
                   selectedApp={selectedApp}
                   createMode={createMode}
                   editingAppId={editingAppId}
                   searchKeyword={searchKeyword}
                   onCreateDialog={() => { setCreateMode('dialog'); setEditingAppId(null); }}
                   onCreateInfo={() => { setCreateMode('info'); setEditingAppId(null); }}
                   onCancelCreate={() => setCreateMode('none')}
                   onCancelEdit={() => { setEditingAppId(null); setCreateMode('none'); }}
                   onSave={handleSaveApp}
                   onDelete={() => selectedApp && handleDeleteApp(selectedApp)}
                   onEdit={() => selectedApp && handleEditApp(selectedApp)}
                 />
               </div>
             </>
          )}
        </main>
      </div>

      {activeMenu === '知识库管理' && <KbOperationRecords records={kbRecords} />}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
