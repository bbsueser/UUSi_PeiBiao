/**
 * 考试大厅页面交互脚本
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const examTypeCards = document.querySelectorAll('.exam-type-card');
    const examTypeFilter = document.getElementById('examTypeFilter');
    const examStatusFilter = document.getElementById('examStatusFilter');
    const keywordSearch = document.getElementById('keywordSearch');
    const searchBtn = document.getElementById('searchBtn');
    const filterTags = document.querySelectorAll('.filter-tag');
    const examListItems = document.querySelectorAll('.exam-list-item');

    // 当前筛选状态
    let currentFilters = {
        type: '',
        status: '',
        keyword: '',
        tag: 'all'
    };

    /**
     * 应用所有筛选条件
     */
    function applyFilters() {
        examListItems.forEach(item => {
            const itemType = item.dataset.type;
            const itemStatus = item.dataset.status;
            const itemName = item.querySelector('.exam-name').textContent.toLowerCase();
            
            let visible = true;

            // 类型筛选
            if (currentFilters.type && itemType !== currentFilters.type) {
                visible = false;
            }

            // 状态筛选
            if (currentFilters.status && itemStatus !== currentFilters.status) {
                visible = false;
            }

            // 关键字筛选
            if (currentFilters.keyword && !itemName.includes(currentFilters.keyword.toLowerCase())) {
                visible = false;
            }

            // 标签筛选
            if (currentFilters.tag !== 'all') {
                // 这里可以根据实际需求扩展标签筛选逻辑
                // 例如：'my' - 我的考试，'completed' - 已完成，'pending' - 待参加
                if (currentFilters.tag === 'completed' && itemStatus !== 'ended') {
                    visible = false;
                }
                if (currentFilters.tag === 'pending' && itemStatus !== 'upcoming') {
                    visible = false;
                }
            }

            // 显示或隐藏考试项
            if (visible) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    /**
     * 考试类型卡片点击事件
     */
    examTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的active状态
            examTypeCards.forEach(c => c.classList.remove('active'));
            
            // 添加当前卡片的active状态
            this.classList.add('active');
            
            // 更新筛选条件
            const type = this.dataset.type;
            currentFilters.type = type;
            
            // 同步更新下拉框
            examTypeFilter.value = type;
            
            // 应用筛选
            applyFilters();
        });
    });

    /**
     * 考试类型下拉框变化事件
     */
    examTypeFilter.addEventListener('change', function() {
        currentFilters.type = this.value;
        
        // 同步更新卡片状态
        examTypeCards.forEach(card => {
            if (card.dataset.type === this.value) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        applyFilters();
    });

    /**
     * 状态下拉框变化事件
     */
    examStatusFilter.addEventListener('change', function() {
        currentFilters.status = this.value;
        applyFilters();
    });

    /**
     * 搜索按钮点击事件
     */
    searchBtn.addEventListener('click', function() {
        currentFilters.keyword = keywordSearch.value.trim();
        applyFilters();
    });

    /**
     * 关键字输入框回车事件
     */
    keywordSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentFilters.keyword = this.value.trim();
            applyFilters();
        }
    });

    /**
     * 标签筛选点击事件
     */
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 移除所有标签的active状态
            filterTags.forEach(t => t.classList.remove('active'));
            
            // 添加当前标签的active状态
            this.classList.add('active');
            
            // 更新筛选条件
            currentFilters.tag = this.dataset.filter;
            
            // 应用筛选
            applyFilters();
        });
    });

    /**
     * 进入考场按钮点击事件
     */
    document.querySelectorAll('.enter-exam-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) {
                return;
            }
            
            // 获取考试名称
            const examItem = this.closest('.exam-list-item');
            const examName = examItem.querySelector('.exam-name').textContent;
            
            // 显示提示（实际项目中应该跳转到考试页面）
            alert(`即将进入考试：${examName}\n\n请注意考试时间，准备好后点击确定进入。`);
        });
    });

    /**
     * 初始化：默认显示所有考试
     */
    applyFilters();
});