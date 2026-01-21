
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Trophy, PlusCircle, CheckCircle, Users, Bell, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Task, TaskStatus, Member, RankingData, TaskDifficulty } from './types';
import { THEME_COLORS, TMCLogo } from './constants';

// Mock Initial Data
const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: '田中 太郎', role: '代表', avatar: 'https://picsum.photos/seed/m1/100' },
  { id: 'm2', name: '佐藤 花子', role: '広報', avatar: 'https://picsum.photos/seed/m2/100' },
  { id: 'm3', name: '鈴木 一郎', role: '企画', avatar: 'https://picsum.photos/seed/m3/100' },
  { id: 'm4', name: '高橋 健太', role: '会計', avatar: 'https://picsum.photos/seed/m4/100' },
];

const now = Date.now();
const oneDay = 86400000;

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: '春の新歓チラシ作成', description: '新入生向けの広報用チラシのデザイン', assigneeId: 'm2', assigneeName: '佐藤 花子', difficulty: 3, status: TaskStatus.COMPLETED, createdAt: now - oneDay * 5, completedAt: now - oneDay * 2, dueDate: now - oneDay },
  { id: 't2', title: '次期定例会議のアジェンダ作成', description: '4月15日の会議用', assigneeId: 'm1', assigneeName: '田中 太郎', difficulty: 1, status: TaskStatus.DOING, createdAt: now - oneDay, dueDate: now + oneDay * 0.5 }, // Soon
  { id: 't3', title: 'WEBサイトのバグ修正', description: 'トップページのリンク切れ修正', assigneeId: 'm3', assigneeName: '鈴木 一郎', difficulty: 4, status: TaskStatus.PLANNED, createdAt: now - oneDay * 2, dueDate: now - oneDay * 0.5 }, // Overdue
];

const CURRENT_USER_ID = 'm1';

// Components
const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <TMCLogo className="w-8 h-8" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                TMC TaskHub
              </span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}>
                <LayoutGrid className="inline-block w-4 h-4 mr-1 mb-1" />
                タスク管理
              </Link>
              <Link to="/ranking" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ranking') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}>
                <Trophy className="inline-block w-4 h-4 mr-1 mb-1" />
                貢献度ランキング
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 text-sm font-medium text-slate-700">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] mr-2">T</div>
                田中 太郎 (代表)
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Shared Components ---

// Fix: Extract DifficultyBadge to top level to avoid re-creation on every render and for better type handling in JSX lists.
const DifficultyBadge = ({ level }: { level: number }) => {
  const colors = [
    'bg-green-100 text-green-700 border-green-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-red-100 text-red-700 border-red-200',
  ];
  return <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${colors[level-1]}`}>難易度 {level}</span>;
};

// Fix: Extract getDeadlineStatus to top level as a pure helper.
const getDeadlineStatus = (task: Task) => {
  if (task.status === TaskStatus.COMPLETED || !task.dueDate) return 'normal';
  const now = Date.now();
  const timeLeft = task.dueDate - now;
  if (timeLeft < 0) return 'overdue';
  if (timeLeft < oneDay * 2) return 'soon'; // Within 48 hours
  return 'normal';
};

// Fix: Extract TaskCard to top level. This resolves the error on line 183 where TypeScript complained about 'key' not existing on the prop type.
const TaskCard = ({ task, isMyTask, onCompleteTask }: { task: Task, isMyTask: boolean, onCompleteTask?: (id: string) => void }) => {
  const status = getDeadlineStatus(task);
  const isOverdue = status === 'overdue';
  const isSoon = status === 'soon';

  let cardClasses = "bg-white p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ";
  if (isOverdue) cardClasses += "border-red-500 ring-4 ring-red-100 animate-pulse bg-red-50";
  else if (isSoon) cardClasses += "border-orange-400 bg-orange-50/30";
  else cardClasses += "border-slate-100";

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <h3 className={`font-bold text-slate-800 ${isOverdue ? 'text-xl text-red-700' : 'text-lg'}`}>
            {task.title}
          </h3>
          {task.dueDate && (
            <div className={`flex items-center text-xs font-semibold mt-1 ${isOverdue ? 'text-red-600' : isSoon ? 'text-orange-600' : 'text-slate-400'}`}>
              <Calendar className="w-3 h-3 mr-1" />
              期日: {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {isOverdue && <span className="ml-2 flex items-center bg-red-600 text-white px-1.5 py-0.5 rounded animate-bounce"><AlertTriangle className="w-3 h-3 mr-1" />期限超過！</span>}
              {isSoon && <span className="ml-2 flex items-center bg-orange-500 text-white px-1.5 py-0.5 rounded"><Clock className="w-3 h-3 mr-1" />まもなく締切</span>}
            </div>
          )}
        </div>
        <DifficultyBadge level={task.difficulty} />
      </div>
      <p className={`text-sm mb-4 line-clamp-2 ${isOverdue ? 'text-red-800' : 'text-slate-600'}`}>{task.description}</p>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded font-medium ${task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {task.status === TaskStatus.COMPLETED ? '完了' : '進行中'}
        </span>
        {isMyTask && task.status !== TaskStatus.COMPLETED && onCompleteTask && (
          <button 
            onClick={() => onCompleteTask(task.id)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-bold shadow-sm"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            完了を報告
          </button>
        )}
      </div>
    </div>
  );
};

// --- Pages ---

const DashboardPage = ({ tasks, members, onAddTask, onCompleteTask }: { tasks: Task[], members: Member[], onAddTask: (t: Partial<Task>) => void, onCompleteTask: (id: string) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', difficulty: 3 as TaskDifficulty, dueDate: '' });

  const myTasks = tasks.filter(t => t.assigneeId === CURRENT_USER_ID);
  const othersTasks = tasks.filter(t => t.assigneeId !== CURRENT_USER_ID);

  const handleAdd = () => {
    if (!formData.title) return;
    onAddTask({
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
    });
    setFormData({ title: '', description: '', difficulty: 3, dueDate: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">タスク管理</h1>
          <p className="text-slate-500">自分のタスクを宣言し、団体の進捗を可視化します。</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-semibold"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          タスクを宣言する
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
              自分のタスク
            </h2>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-medium">{myTasks.length}件</span>
          </div>
          <div className="space-y-4">
            {myTasks.length === 0 && <p className="text-slate-400 text-center py-8 border-2 border-dashed rounded-xl">現在宣言しているタスクはありません</p>}
            {myTasks.map(task => (
              /* Fix: Passing onCompleteTask explicitly to the extracted TaskCard component */
              <TaskCard key={task.id} task={task} isMyTask={true} onCompleteTask={onCompleteTask} />
            ))}
          </div>
        </section>

        {/* All Tasks Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-2"></span>
              メンバーの動き
            </h2>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-medium">{othersTasks.length}件</span>
          </div>
          <div className="space-y-4">
            {othersTasks.map(task => (
              <div key={task.id} className="flex gap-4 items-start p-4 bg-white rounded-xl border border-slate-100">
                <div className="flex-shrink-0">
                  <img src={members.find(m => m.id === task.assigneeId)?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{task.assigneeName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1">
                    <TaskCard task={task} isMyTask={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Declaration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-800">
              <PlusCircle className="w-6 h-6 mr-2 text-blue-600" />
              タスク宣言
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">何を行いますか？</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例: 合宿のしおり作成"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">期日設定</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">※空欄の場合は無期限となります</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">詳細 (任意)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24"
                  placeholder="具体的な内容を記入してください"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">難易度設定</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(lv => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setFormData({...formData, difficulty: lv as TaskDifficulty})}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${formData.difficulty === lv ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 px-1">
                  <span>易しい</span>
                  <span>難しい</span>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!formData.title}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                >
                  宣言する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RankingPage = ({ tasks, members }: { tasks: Task[], members: Member[] }) => {
  const rankingData: RankingData[] = useMemo(() => {
    return members.map(member => {
      const completedTasks = tasks.filter(t => t.assigneeId === member.id && t.status === TaskStatus.COMPLETED);
      const totalScore = completedTasks.reduce((sum, t) => sum + (1 * t.difficulty), 0);
      return {
        memberId: member.id,
        memberName: member.name,
        totalScore,
        completedTasksCount: completedTasks.length,
        avatar: member.avatar
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [tasks, members]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">貢献度ランキング</h1>
        <p className="text-slate-500">タスク量 × 難易度で算出された、今期の活躍ランキングです。</p>
      </div>

      {/* Top 3 Visual */}
      <div className="flex justify-center items-end gap-4 mb-12 px-4">
        {rankingData[1] && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 mb-2 overflow-hidden shadow-md">
              <img src={rankingData[1].avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="bg-slate-200 w-24 h-24 rounded-t-xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-slate-500">2</span>
              <span className="text-[10px] font-bold text-slate-500">{rankingData[1].totalScore} pts</span>
            </div>
            <span className="text-xs mt-2 font-bold text-slate-600 truncate max-w-[96px]">{rankingData[1].memberName}</span>
          </div>
        )}
        {rankingData[0] && (
          <div className="flex flex-col items-center -mt-8">
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500">
                <Trophy className="w-10 h-10 drop-shadow-lg" fill="currentColor" />
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-yellow-400 mb-2 overflow-hidden shadow-xl ring-4 ring-yellow-400/20">
                <img src={rankingData[0].avatar} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <div className="bg-yellow-400 w-28 h-32 rounded-t-xl flex flex-col items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">1</span>
              <span className="text-xs font-bold text-white/90">{rankingData[0].totalScore} pts</span>
            </div>
            <span className="text-sm mt-2 font-bold text-slate-800 truncate max-w-[112px]">{rankingData[0].memberName}</span>
          </div>
        )}
        {rankingData[2] && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-orange-200 mb-2 overflow-hidden shadow-md">
              <img src={rankingData[2].avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="bg-orange-200 w-24 h-20 rounded-t-xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-orange-600">3</span>
              <span className="text-[10px] font-bold text-orange-600">{rankingData[2].totalScore} pts</span>
            </div>
            <span className="text-xs mt-2 font-bold text-slate-600 truncate max-w-[96px]">{rankingData[2].memberName}</span>
          </div>
        )}
      </div>

      {/* Full List */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center space-x-12">
            <span>順位 / メンバー</span>
          </div>
          <div className="flex items-center space-x-16">
            <span>タスク数</span>
            <span>合計ポイント</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {rankingData.map((data, index) => (
            <div key={data.memberId} className="px-6 py-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'text-white' : 'text-slate-400'} ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-orange-300' : 'bg-transparent'}`}>
                  {index + 1}
                </span>
                <div className="flex items-center space-x-3">
                  <img src={data.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                  <div>
                    <p className="font-bold text-slate-800 leading-none mb-1">{data.memberName}</p>
                    <p className="text-[10px] text-slate-400">{members.find(m => m.id === data.memberId)?.role}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-12">
                 <div className="text-right w-16">
                    <span className="text-lg font-bold text-slate-700">{data.completedTasksCount}</span>
                    <span className="text-[10px] text-slate-400 ml-1">件</span>
                 </div>
                 <div className="text-right w-24">
                    <span className="text-2xl font-black text-blue-600">{data.totalScore}</span>
                    <span className="text-[10px] text-blue-400 ml-1">PTS</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- App Container ---

const AppContent = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      assigneeId: CURRENT_USER_ID,
      assigneeName: INITIAL_MEMBERS.find(m => m.id === CURRENT_USER_ID)?.name || 'Unknown',
      difficulty: taskData.difficulty || 1,
      status: TaskStatus.DOING,
      createdAt: Date.now(),
      dueDate: taskData.dueDate,
    };
    setTasks([newTask, ...tasks]);
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: TaskStatus.COMPLETED, completedAt: Date.now() } : t
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="animate-in fade-in duration-500">
        <Routes>
          <Route path="/" element={<DashboardPage tasks={tasks} members={INITIAL_MEMBERS} onAddTask={addTask} onCompleteTask={completeTask} />} />
          <Route path="/ranking" element={<RankingPage tasks={tasks} members={INITIAL_MEMBERS} />} />
        </Routes>
      </main>
      
      {/* Toast Notification for demonstration */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      </div>
    </div>
  );
};

const App = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
