import React, { useState } from 'react';
import { Search, User, Menu, ChevronRight, Activity, Zap, FileText, Droplets, MessageSquare, TrendingUp, Bell, ThumbsUp, HelpCircle, Store, Globe, Filter, X, Check, Calendar, Plus, LayoutDashboard, ShieldCheck, Package, ListTodo, Heart, History, UserCheck, MapPin, Phone, Building2, LogOut, Trash2, Image, Paperclip, Send, SquarePen, Monitor, Factory, CheckCircle2, Upload, MousePointer2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CATEGORIES_HIERARCHY, PRODUCTS, TECH_CASES, DEMANDS, NEWS, POLICIES, STANDARDS } from './data';
import { getWaterSavingDiagnosis } from './services/aiService';

// Roles Definition
const ROLES = [
  { id: 'industrial', name: '用水户口', org: '广西博世科环保', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { id: 'gov', name: '政府用户', org: '南宁市水利局', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
  { id: 'expert', name: '技术专家', org: '中国水科院', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  { id: 'provider', name: '服务商', org: '润霖水务技术', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
];

// Navbar Component
const Navbar = ({ currentRole, onRoleChange, currentView, onViewChange, onAuthClick }: { 
  currentRole: typeof ROLES[0], 
  onRoleChange: (role: typeof ROLES[0]) => void,
  currentView: string,
  onViewChange: (view: 'home' | 'policy' | 'exhibition' | 'forum' | 'cases' | 'industry-login' | 'industry-dashboard' | 'industry-identity' | 'industry-auth') => void,
  onAuthClick: (mode: 'login' | 'register') => void
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b flex items-center px-10 justify-center flex-shrink-0 sticky top-0 z-50">
      <div className="flex items-center justify-between w-full max-w-[1440px]">
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onViewChange('home')}>
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
            <Droplets className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">水麒麟节水平台</h1>
        </div>
        
        <nav className="hidden md:flex flex-1 justify-center gap-8 text-base font-bold text-gray-600 h-full items-center">
          <button 
            onClick={() => onViewChange('home')}
            className={cn(
              "h-20 flex items-center px-1 transition-all border-b-2",
              currentView === 'home' ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-blue-600"
            )}
          >
            首页
          </button>
          <button 
            onClick={() => onViewChange('forum')}
            className={cn(
              "h-20 flex items-center px-1 transition-all border-b-2",
              currentView === 'forum' ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-blue-600"
            )}
          >
            交流合作（含需求发布）
          </button>
          <button 
            onClick={() => onViewChange('industry-login')}
            className={cn(
              "h-20 flex items-center px-1 transition-all border-b-2",
              currentView === 'industry-login' || currentView === 'industry-dashboard' ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-blue-600"
            )}
          >
            产业信息
          </button>
          <button 
            onClick={() => onViewChange('policy')}
            className={cn(
              "h-20 flex items-center px-1 transition-all border-b-2",
              currentView === 'policy' ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-blue-600"
            )}
          >
            新闻资讯
          </button>
          <button className="hover:text-blue-600 h-20 flex items-center px-1 transition-colors">关于平台</button>
          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={() => onAuthClick('login')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              登录/注册
            </button>
            <button 
              onClick={() => onViewChange('industry-identity')}
              className="px-6 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[13px] font-black hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              企业认证
            </button>
          </div>
        </nav>

        <div className="relative shrink-0">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-2xl bg-gray-50/50 hover:bg-blue-50 transition-all border border-gray-100/50 hover:border-blue-100 group shadow-sm active:scale-95"
          >
            <div className="text-right hidden lg:block select-none">
              <p className="text-sm font-black text-gray-800 leading-none">{currentRole.name}</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm border border-gray-100 group-hover:ring-blue-200 transition-all">
                <img src={currentRole.avatar} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-transform duration-300", isMenuOpen ? "rotate-90 text-blue-600" : "")} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-3xl border border-blue-50 z-20 py-4 overflow-hidden"
                >
                  <div className="px-6 py-3 border-b border-gray-50 mb-3 bg-blue-50/20">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">切换角色视角</span>
                    <p className="text-xs text-gray-400 mt-1 font-medium">根据不同身份体验定制化服务</p>
                  </div>
                  <div className="space-y-1.5 px-3">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          onRoleChange(role);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group/item relative overflow-hidden",
                          currentRole.id === role.id 
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                            : "hover:bg-blue-50 text-gray-600 border border-transparent hover:border-blue-100"
                        )}
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform group-hover/item:scale-110 border border-white",
                          currentRole.id === role.id ? "ring-2 ring-white/30" : "ring-1 ring-gray-100"
                        )}>
                          <img src={role.avatar} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={role.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-black truncate", currentRole.id === role.id ? "text-white" : "text-gray-800")}>{role.name}</p>
                          <p className={cn("text-[10px] font-bold truncate", currentRole.id === role.id ? "text-blue-100/80" : "text-gray-400")}>{role.org}</p>
                        </div>
                        {currentRole.id === role.id && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mx-3 mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-black text-gray-400 hover:text-red-500 transition-colors">
                      <Zap className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// Vertical Categories Component with Flyout
const VerticalCategories = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="relative group/sidebar h-full" onMouseLeave={() => setHoveredCategory(null)}>
      {/* Sidebar List */}
      <div className="w-full bg-white flex flex-col border border-gray-200 shadow-sm rounded-l-xl z-20 relative h-full">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span className="text-xs font-black text-gray-400 uppercase tracking-[0.1em]">节水产业分类</span>
          <Menu className="w-3 h-3 text-gray-300" />
        </div>
        <div className="flex-1 flex flex-col pt-2">
          {CATEGORIES_HIERARCHY.map((cat, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              className={cn(
                "px-5 py-3.5 text-sm flex justify-between items-center cursor-pointer transition-all border-l-4",
                hoveredCategory === cat.id 
                  ? "bg-blue-50 text-blue-700 border-blue-600 font-bold" 
                  : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              <span>{cat.name}</span>
              <ChevronRight className={cn("w-3 h-3 opacity-30", hoveredCategory === cat.id && "opacity-100")} />
            </div>
          ))}
        </div>
      </div>

      {/* Flyout Panel */}
      <AnimatePresence>
        {hoveredCategory && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onMouseLeave={() => setHoveredCategory(null)}
            className="absolute left-full top-0 w-[600px] bg-white border border-gray-200 shadow-2xl rounded-r-xl h-full z-50 p-8 flex flex-col gap-8"
          >
            {CATEGORIES_HIERARCHY.find(c => c.id === hoveredCategory)?.subCategories.map((sub, j) => (
              <div key={j} className="flex gap-10">
                <div className="w-24 shrink-0 flex items-center justify-end text-sm font-black text-gray-800 gap-2 border-r border-gray-100 pr-4 text-right">
                  {sub.name} <ChevronRight className="w-3 h-3 text-gray-300" />
                </div>
                <div className="flex-1 flex flex-wrap gap-x-6 gap-y-3">
                  {sub.items.map((item, k) => (
                    <a key={k} href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Featured Brand in Flyout */}
            <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
              <div className="flex gap-4">
                 <div className="px-4 py-2 bg-gray-50 rounded border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    热门供应商
                 </div>
                 <div className="flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold text-gray-700">广西博世科环保科技</span>
                 </div>
              </div>
              <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
                查看该类目全量列表 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// AIDiagnosisModal
const AIDiagnosisModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: '您好！我是您的专属节水管家“水麒麟”。为了为您提供最精准的节水方案，请问您目前主要的用水场景是什么？（例如：工厂制造、农业灌溉、商场物业等）' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('深度诊断');

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const context = messages.map(m => `${m.role === 'ai' ? '助手' : '用户'}: ${m.content}`).join('\n');
      const response = await getWaterSavingDiagnosis(userMessage, context);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: '抱歉，我现在遇到了一点小问题，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ["工业产线", "智慧农业", "住宅小区", "公共洗手间", "学校/医院", "市政管网", "酒店物业"];
  const suggestedKeywords = ["冷却塔漂水", "管道漏损", "水平衡测试", "精密喷灌", "中水回用", "水效标签", "冷凝水回收", "蒸汽系统漏汽", "高效节水器具"];
  const tabs = ["深度诊断", "技术问答", "方案生成", "项目初审"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-900/10 backdrop-blur-3xl" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#f5f8ff] w-full max-w-[1240px] h-[85vh] rounded-[40px] shadow-3xl overflow-hidden flex border border-white/50"
          >
            {/* Sidebar (Afu Style) */}
            <div className="w-[300px] border-r border-gray-100 bg-white/40 flex flex-col p-6 shrink-0">
               <div className="flex items-center gap-3 mb-10 px-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-200">
                     <Droplets className="text-white w-5 h-5" />
                  </div>
                  <span className="text-xl font-black text-gray-800 tracking-tight">水麒麟</span>
               </div>

               <button className="w-full bg-white hover:bg-gray-50 border border-gray-100 py-3.5 rounded-2xl flex items-center justify-between px-5 group transition-all shadow-sm mb-10">
                  <span className="text-sm font-black text-blue-600">开启新对话</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-gray-300 py-0.5 px-1.5 border border-gray-100 rounded-md">Ctrl</span>
                     <span className="text-[10px] font-bold text-gray-300 py-0.5 px-1.5 border border-gray-100 rounded-md">K</span>
                  </div>
               </button>

               <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">最近记录</h4>
                    <div className="space-y-1">
                       <p className="text-xs text-gray-400 font-bold px-4 py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                         您的历史记录会显示在这里
                       </p>
                    </div>
                  </div>
               </div>

               <div className="mt-auto space-y-4 pt-6 border-t border-gray-100">
                  {[
                    { icon: <UserCheck className="w-4 h-4" />, name: "点击登录账户" }
                  ].map((item, i) => (
                    <button key={i} className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors">
                       {item.icon}
                       {item.name}
                    </button>
                  ))}
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
               {/* Close Button */}
               <button onClick={onClose} className="absolute top-6 right-8 z-20 p-2 hover:bg-white rounded-full transition-all text-gray-300 hover:text-gray-600">
                  <X className="w-6 h-6" />
               </button>

               {/* Central Greeting (Always visible if no messages or condensed if messages exist) */}
               <div className={cn(
                 "flex flex-col items-center transition-all duration-700",
                 messages.length > 0 ? "pt-10 pb-4" : "flex-1 justify-center pb-20"
               )}>
                  {messages.length === 0 || (messages.length === 1 && messages[0].role === 'ai') ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                       <div className="relative mb-10 flex justify-center">
                          <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-200 rotate-12 relative z-10">
                             <Droplets className="text-white w-12 h-12" />
                          </div>
                       </div>
                       <h2 className="text-4xl font-black text-gray-800 mb-6">
                         我是 <span className="text-blue-600">水管家</span><br />
                         你的AI节水专家
                       </h2>
                       <p className="text-sm font-bold text-gray-400 tracking-wider">
                         设备漏损 · 工艺优化 · 政策解读 · 各大难题，都来问我吧~
                       </p>
                    </motion.div>
                  ) : null}
               </div>

               {/* Messages List (if active) */}
               {messages.length > 1 && (
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-20 py-10 space-y-10 custom-scrollbar"
                  >
                    {messages.map((m, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-6 max-w-[900px]",
                          m.role === 'user' ? "ml-auto flex-row-reverse" : "mx-auto"
                        )}
                      >
                         <div className={cn(
                           "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg",
                           m.role === 'ai' ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-white border border-gray-100"
                         )}>
                            {m.role === 'ai' ? <Droplets className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-400" />}
                         </div>
                         <div className={cn(
                           "p-6 rounded-[24px] text-base leading-relaxed",
                           m.role === 'ai' 
                             ? "bg-white border border-blue-50/50 text-gray-800 shadow-sm" 
                             : "bg-blue-600 text-white shadow-xl shadow-blue-100"
                         )}>
                           {m.content.split('\n').map((line, idx) => (
                             <p key={idx} className={idx > 0 ? "mt-3" : ""}>{line}</p>
                           ))}
                         </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex gap-6 mx-auto max-w-[900px]">
                         <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-white animate-pulse" />
                         </div>
                         <div className="bg-white p-6 rounded-[24px] border border-blue-50/50 shadow-sm">
                            <div className="flex gap-1.5">
                               <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                               <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                               <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
               )}

               {/* Floating Input Area (Afu Style) */}
               <div className="px-20 pb-12 pt-4 relative">
                  <div className="max-w-[900px] mx-auto bg-white rounded-[32px] shadow-2xl shadow-blue-100/40 border border-blue-50 overflow-hidden">
                     {/* Input Tabs */}
                     <div className="flex items-center px-6 py-2 bg-gray-50/50 border-b border-gray-100">
                        {tabs.map(tab => (
                          <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                              "px-5 py-2.5 text-xs font-black transition-all relative",
                              activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                             {activeTab === tab && <div className="absolute top-0 left-0 w-full h-full bg-blue-50 rounded-lg -z-10" />}
                             {tab}
                          </button>
                        ))}
                     </div>

                     {/* Textarea */}
                     <div className="relative">
                        <textarea 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                          placeholder="聚焦工况细节，专业诊断评估..."
                          className="w-full px-8 py-6 text-lg font-bold text-gray-800 placeholder:text-gray-300 resize-none h-[180px] focus:outline-none"
                        />

                        {/* Bottom Guiding Words (Retained Design but Integrated) */}
                        <div className="px-8 pb-4 flex flex-wrap gap-2">
                           {quickReplies.slice(0, 3).map(reply => (
                             <button 
                               key={reply}
                               onClick={() => setInput(reply)}
                               className="text-[10px] font-black text-blue-600/60 bg-blue-50/30 px-3 py-1 rounded-lg border border-blue-100/20 hover:bg-blue-100 transition-all"
                             >
                               {reply}
                             </button>
                           ))}
                           {suggestedKeywords.slice(0, 3).map(kw => (
                             <button 
                               key={kw}
                               onClick={() => setInput(prev => `${prev}${prev ? '，' : ''}${kw}`)}
                               className="text-[10px] font-black text-orange-600/60 bg-orange-50/30 px-3 py-1 rounded-lg border border-orange-100/20 hover:bg-orange-100 transition-all"
                             >
                               #{kw}
                             </button>
                           ))}
                        </div>

                        {/* Actions */}
                        <div className="absolute bottom-6 right-8 flex items-center gap-4">
                           <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                              <Image className="w-5 h-5" />
                           </button>
                           <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors mr-2">
                              <Paperclip className="w-5 h-5" />
                           </button>
                           <button 
                             onClick={handleSend}
                             disabled={!input.trim() || loading}
                             className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-30"
                           >
                              <Send className="w-5 h-5 rotate-0" />
                           </button>
                        </div>
                     </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="mt-4 text-center">
                     <p className="text-[10px] font-black text-gray-300 tracking-widest uppercase">
                       智能诊断基于工业大数据模型 · 数据安全已加密
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ForumModule (New Section)
const ForumModule = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'user' | 'industry' | 'gov'>('all');

  const categories = [
    { id: 'all', name: '全部动态', icon: <Globe className="w-4 h-4" /> },
    { id: 'user', name: '用水户专区', icon: <User className="w-4 h-4" /> },
    { id: 'industry', name: '产业主体专区', icon: <Activity className="w-4 h-4" /> },
    { id: 'gov', name: '政企沟通空间', icon: <Bell className="w-4 h-4" /> },
  ];

  const FORUM_POSTS = [
    {
      id: 1,
      role: 'user',
      author: '某工业园区管理处',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      title: '关于区域水重复利用率提升的技术寻求',
      content: '目前园区内日均用水量较大，希望能找到一套针对电子半导体行业的废水零排放解决方案。',
      tags: ['求助', '废水处理'],
      likes: 24,
      comments: 8,
      time: '12分钟前'
    },
    {
      id: 2,
      role: 'industry',
      author: '科远节水研发中心',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
      title: '新款智能超声波水表内测邀请',
      content: '诚邀5家具备集中供水场景的物业或企业参与新一代NB-IoT智能水表的免费试用。',
      tags: ['首发', '智能硬件'],
      likes: 156,
      comments: 42,
      time: '1小时前'
    },
    {
      id: 3,
      role: 'gov',
      author: '省水利厅政策研究室',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
      title: '《2024年节水型社会建设奖励办法》征求意见中',
      content: '请广大用水户和相关产业单位就后续奖励金额分配、补贴流程优化等事宜发表意见。',
      tags: ['政务通知', '意见征集'],
      likes: 89,
      comments: 124,
      time: '3小时前'
    }
  ];

  const filteredPosts = activeCategory === 'all' ? FORUM_POSTS : FORUM_POSTS.filter(p => p.role === activeCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
      {/* Forum Sidebar */}
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 mb-8 group">
            <Plus className="w-5 h-5 bg-white/20 rounded-lg p-0.5 group-hover:rotate-90 transition-transform" />
            发布动态 / 需求
          </button>
          
          <div className="space-y-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-[13px]",
                  activeCategory === cat.id 
                    ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <span className={cn(
                   "p-2 rounded-xl transition-all",
                   activeCategory === cat.id ? "bg-white text-blue-600 shadow-sm" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-gray-600"
                )}>
                  {cat.icon}
                </span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="text-xl font-black mb-4 relative z-10">热门话题</h4>
          <p className="text-blue-50/80 text-xs font-bold leading-relaxed mb-8 relative z-10 line-clamp-3">参与“2023供水漏损控制”技术攻关，最高可获得50万政府奖励基金。</p>
          <button className="w-full bg-white text-blue-600 font-extrabold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform text-xs relative z-10">
            立即参与讨论
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between bg-white px-10 py-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex gap-10">
             {['最新发布', '热门讨论', '待解决需求'].map((t, i) => (
               <button key={t} className={cn(
                 "text-sm font-black transition-all relative pb-1",
                 i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
               )}>{t}</button>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           {filteredPosts.map(post => (
             <motion.div 
               layout
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={post.id} 
               className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all group"
             >
                <div className="flex gap-8">
                   <img src={post.avatar} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-md grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <span className="font-extrabold text-gray-800 text-base">{post.author}</span>
                            <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                            <span className="text-xs text-gray-400 font-black uppercase tracking-wider">{post.time}</span>
                         </div>
                         <div className="flex gap-3">
                            {post.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-black px-4 py-1.5 bg-gray-50 text-gray-400 rounded-full border border-gray-100 uppercase tracking-tighter">{tag}</span>
                            ))}
                         </div>
                      </div>
                      <h4 className="text-2xl font-black text-gray-800 mb-6 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h4>
                      <p className="text-base text-gray-500 font-medium leading-relaxed line-clamp-3 mb-10">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-10 pt-8 border-t border-gray-50">
                         <button className="flex items-center gap-2.5 text-sm font-black text-gray-400 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="w-5 h-5" />
                            {post.likes}
                         </button>
                         <button className="flex items-center gap-2.5 text-sm font-black text-gray-400 hover:text-blue-600 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            {post.comments}
                         </button>
                         <button className="ml-auto text-sm font-extrabold text-blue-600 bg-blue-50 px-8 py-3 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-100">
                            立即参与
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

// Industry Dashboard Component
const IndustryDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('企业认证');

  const menuItems = [
    { name: '首页', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '企业认证', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: '我的资源', icon: <Package className="w-5 h-5" /> },
    { name: '我的需求', icon: <ListTodo className="w-5 h-5" /> },
    { name: '我参加的活动', icon: <Calendar className="w-5 h-5" /> },
    { name: '我的消息', icon: <MessageSquare className="w-5 h-5" /> },
    { name: '我的收藏', icon: <Heart className="w-5 h-5" /> },
    { name: '我的评论', icon: <MessageSquare className="w-4 h-4 ml-1" /> },
    { name: '信息征集报名', icon: <FileText className="w-5 h-5" /> },
    { name: '浏览历史', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-200px)] bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
      {/* Sidebar */}
      <div className="w-72 bg-[#0a1128] text-white flex flex-col pt-10">
        <div className="px-10 mb-12">
           <div className="text-xl font-black text-white/50 mb-1">你好</div>
           <div className="text-sm font-bold text-white/30">欢迎来到工作台！</div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black transition-all",
                activeTab === item.name 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <span className={cn(
                "transition-colors",
                activeTab === item.name ? "text-white" : "text-white/20"
              )}>
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black text-red-400 hover:bg-red-400/10 transition-all"
           >
              <LogOut className="w-5 h-5" />
              退出登录
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50/50 p-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{activeTab}</h2>
            <div className="flex items-center gap-4">
               <button className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-blue-600 transition-all shadow-sm">
                  <Bell className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                     <div className="text-xs font-black text-gray-800">江苏省水利工程...</div>
                     <div className="text-[10px] font-bold text-gray-400">超级管理员</div>
                  </div>
                  <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
               </div>
            </div>
        </div>

        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm min-h-[600px]">
          {activeTab === '企业认证' ? (
            <div className="max-w-4xl space-y-10">
               {/* Corporate Authentication Form (Simplified matches screenshot) */}
               <div className="grid grid-cols-1 gap-8">
                  <div className="flex items-center gap-8">
                     <label className="w-32 text-sm font-bold text-gray-600 text-right"><span className="text-red-500 mr-1">*</span>企业名称</label>
                     <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" defaultValue="江苏省水利工程科技咨询股份有限公司" />
                  </div>
                  <div className="flex items-center gap-8">
                     <label className="w-32 text-sm font-bold text-gray-600 text-right"><span className="text-red-500 mr-1">*</span>企业供需类型</label>
                     <select className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all">
                        <option>需求企业（工业应用企业）</option>
                        <option>产业主体（设备/技术供应）</option>
                        <option>第三方服务机构</option>
                     </select>
                  </div>
                  <div className="flex items-center gap-8">
                     <label className="w-32 text-sm font-bold text-gray-600 text-right"><span className="text-red-500 mr-1">*</span>拟需要的资源</label>
                     <div className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-400 italic">请选择拟需要的资源，可多选</div>
                  </div>
                  <div className="flex items-start gap-8">
                     <label className="w-32 text-sm font-bold text-gray-600 text-right mt-4"><span className="text-red-500 mr-1">*</span>企业简介</label>
                     <textarea className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-700 min-h-[120px] focus:bg-white focus:border-blue-200 focus:outline-none transition-all" placeholder="请输入企业简介..." />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right">组织机构代码</label>
                        <input className="flex-1 bg-gray-100 border border-transparent rounded-xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed" defaultValue="46600625-2" readOnly />
                     </div>
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right">法人姓名</label>
                        <input className="flex-1 bg-gray-100 border border-transparent rounded-xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed" defaultValue="顾红勤" readOnly />
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right">所在省</label>
                        <input className="flex-1 bg-gray-100 border border-transparent rounded-xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed" defaultValue="江苏省" readOnly />
                     </div>
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right">所在市区</label>
                        <input className="flex-1 bg-gray-100 border border-transparent rounded-xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed" defaultValue="南京市" readOnly />
                     </div>
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right">详细地址</label>
                        <input className="flex-1 bg-gray-100 border border-transparent rounded-xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed" defaultValue="南京市上海路5号水利大厦15楼" readOnly />
                     </div>
                  </div>

                  <div className="flex items-start gap-8">
                     <label className="w-32 text-sm font-bold text-gray-600 text-right mt-4"><span className="text-red-500 mr-1">*</span>营业执照</label>
                     <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-300 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group">
                        <Plus className="w-8 h-8 group-hover:text-blue-400 mb-2" />
                        <span className="text-[10px] font-black group-hover:text-blue-600 uppercase tracking-widest">点击并上传</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right"><span className="text-red-500 mr-1">*</span>联系人</label>
                        <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" placeholder="请输入联系人姓名" />
                     </div>
                     <div className="flex items-center gap-8">
                        <label className="w-32 text-sm font-bold text-gray-600 text-right"><span className="text-red-500 mr-1">*</span>联系电话</label>
                        <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" placeholder="请输入联系电话" />
                     </div>
                  </div>

                  <div className="pt-10 flex gap-4 pl-40">
                     <button className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">提交申请</button>
                     <button className="px-12 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">重置表单</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-200">
                  {menuItems.find(m => m.name === activeTab)?.icon}
               </div>
               <h3 className="text-xl font-black text-gray-300">功能模块「{activeTab}」暂未开放</h3>
               <p className="text-xs text-gray-200 font-bold mt-2 uppercase tracking-widest">Ongoing Development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// IndustryLogin Component
const IndustryLogin = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-[800px] flex items-center justify-center py-20 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
       </div>

       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-[1000px] bg-white rounded-[60px] overflow-hidden border border-gray-100 shadow-2xl flex relative z-10"
       >
          {/* Left Side: Illustration & Info */}
          <div className="w-1/2 bg-blue-600 p-16 text-white flex flex-col justify-between">
             <div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10">
                   <Droplets className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-6 leading-tight">产业主体服务门户</h2>
                <p className="text-blue-50/70 text-lg font-medium leading-relaxed mb-10">
                   为节水设备商、技术提供方以及工程建设企业提供全方位的供需对接、项目申报以及产业展示服务。
                </p>
                <div className="space-y-6">
                   {[
                     { icon: <Zap className="w-4 h-4" />, text: "实时需求精准匹配" },
                     { icon: <Globe className="w-4 h-4" />, text: "3D云展厅在线入驻" },
                     { icon: <Activity className="w-4 h-4" />, text: "产业大数据分析看板" }
                   ].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-sm font-bold">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">{f.icon}</div>
                        {f.text}
                     </div>
                   ))}
                </div>
             </div>
             <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Smart Water Saving Industrial Portal</div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-1/2 p-16 flex flex-col justify-center">
             <div className="mb-12">
                <h3 className="text-3xl font-black text-gray-800 mb-2">欢迎回来</h3>
                <p className="text-sm font-bold text-gray-400">请使用您的企业账号登录系统</p>
             </div>

             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">企业账号 / 统一信用代码</label>
                   <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-16 py-5 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" placeholder="JS_WATER_TECH" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">访问密码</label>
                      <button className="text-[10px] text-blue-600 font-black uppercase tracking-wider hover:underline">找回密码</button>
                   </div>
                   <div className="relative group">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                      <input type="password" underline className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-16 py-5 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" defaultValue="password123" />
                   </div>
                </div>

                <button 
                  onClick={onLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                   进入管理后台
                   <ChevronRight className="w-5 h-5" />
                </button>

                <div className="pt-8 border-t border-gray-50 text-center">
                   <button className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors">
                      还没有账号？<span className="text-blue-600 font-black ml-1">立即注册申请</span>
                   </button>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

// CasesModule (New Section)
const CasesModule = () => {
  const [filter1, setFilter1] = useState<string>('全部');
  const [filter2, setFilter2] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const primaryCategories = ['全部', '农业节水先进案例', '工业节水先进案例', '城镇生活节水先进案例', '常规水开发利用先进案例', '通用节水先进案例'];
  const secondaryCategories = ['全部', '设备制造', '节水服务'];

  const CASES_DATA = [
    {
      id: 1,
      cat1: '农业节水先进案例',
      cat2: '设备制造',
      name: '新疆沙雅县：农业深度节水试点实现四维共赢',
      content: '新疆沙雅县地处塔克拉玛干沙漠北缘，长期受水资源时空不均、农业用水效率低等难题制约。近年来，沙雅县立足节水增收“沙雅模式”实践经验，初步实现了从“高效节水增收”向“高效用水增收”的转型升级。',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
      region: '新疆',
      source: '新疆维吾尔自治区水利厅',
      date: '2026-03-20',
      views: '1,280',
      fullContent: [
        { type: 'text', title: '一、背景', text: '新疆沙雅县地处塔克拉玛干沙漠北缘，长期受水资源时空不均、农业用水效率低等难题制约。近年来，沙雅县立足节水增收“沙雅模式”实践经验，初步实现了从“高效节水增收”向“高效用水增收”的转型升级，在节水、经济、社会、生态领域收获显著成效。' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200', caption: '50万亩高效节水试点项目棉花采收' },
        { type: 'text', title: '二、做法', text: '一是工程筑基：织密多元供水网，为破解水源保障困境，该县投资7.53亿元，完成结力克水库管道供水、3个村灌溉渠道工程等项目，建成16.15万亩高标准灌溉水源保障工程，供水保证率超90%。\n二是科技赋能：高标准农田提质增效，该县推广内镶贴片式低压小流量滴灌带200万亩，安装自动化施肥罐4万亩、自动化球罐1万亩，探索试行“自动化设备+农技指导”社会化管护模式6000亩。' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200', caption: '高标准农田滴灌管网布设' },
        { type: 'text', title: '三、成效', text: '三是制度创新：筑牢节水长效机制，该县推广初始水权分配等“六位一体”节水机制，覆盖农田250万亩，优化完善五项配套制度，形成精细化管理格局，以“制度+科技”筑牢节约水管理根基。\n棉花苗期用水量从280立方米/亩降至240立方米/亩，亩均节水40立方米，水利生产率提高至1.42kg/m³；经济方面，2025年试点区籽棉单产超500公斤，亩均增产60公斤、增收300元；社会影响方面，灌溉保证率提高至90%以上，农村居民可支配收入达2.4万元以上，农民生活水平持续改善。' }
      ]
    },
    {
      id: 2,
      cat1: '工业节水先进案例',
      cat2: '节水服务',
      name: '江苏两高校入选水利部合同节水典型案例',
      content: '8月27日，水利部办公厅印发《关于发布合同节水典型案例的通知》，江苏省内两高校入选。',
      image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600',
      region: '江苏',
      source: '江苏省节约用水办公室',
      date: '2024-09-11',
      views: '2,450',
      fullContentText: '8月27日，水利部办公厅印发《关于发布合同节水典型案例的通知》，江苏省两高校入选。\n\n常州工程职业技术学院采用“节水效益分享型”合同节水管理模式，建设智慧节水管理系统，覆盖校区全部供水区域，具有远程用水监测、统计分析、漏水预警等功能；建设智慧探漏监测系统，实现管道运行及渗漏情况的实时监测和管道漏点的精确地位；建设雨水浇灌泵站和浇灌管网，将雨水作为学校绿化浇灌主要水源；改造老化供水管网120米。实施合同节水后，学校年平均用水量下降13.8万立方米，节水率为26.9%，年平均节约水费约58万元。\n\n南京钟山职业技术学院采用“用水费用托管型+节水效益分享型”合同节水管理模式，学校与节水服务企业南京联通公司签署为期5年的合作协议，节水服务企业利用通信运营商优势提供云服务平台和资金支持，再与旗下专业供应商签订协议，委托其具体实施学院管网漏损检测、维修改造、智慧节水平台搭建、自助报修系统建立等工作，并约定双方节水收益分成比例。由此形成用水单位、费用总包单位、效益分享单位三方共享节水效益的混合型合同节水模式。项目实施以来，学校人均用水量由93立方米/年降至46立方米/年，节水率达50%。合同期间，预计节水量70.5万立方米，节约水费225万元。'
    },
    {
      id: 3,
      cat1: '城镇生活节水先进案例',
      cat2: '设备制造',
      name: '感应式高效节水器',
      content: '采用高灵敏度红外感应技术，实现人走水断，有效减少写字楼及学校等公共场所的无效用水。',
      image: 'https://images.unsplash.com/photo-1504148455328-497c5ef215d0?auto=format&fit=crop&q=80&w=600',
      region: '广东',
      source: '大禹节水',
      date: '2024-05-10',
      views: '3,120'
    },
    {
      id: 4,
      cat1: '常规水开发利用先进案例',
      cat2: '节水服务',
      name: '雨水收集与回用系统工程',
      content: '通过对园区屋面及道路雨水的统一收集、处理，用于景观绿化及道路冲洗，提高非传统水源利用效率。',
      image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=600',
      region: '北京',
      source: '水利部办公厅',
      date: '2024-02-15',
      views: '1,890'
    },
    {
      id: 5,
      cat1: '通用节水先进案例',
      cat2: '设备制造',
      name: '高精度数字化水平衡测试系统',
      content: '该设备能够实时捕捉各个用水支路的流量波动，精准锁定漏报点，为企业制定节水技改方案提供数据支撑。',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
      region: '浙江',
      source: '水麒麟科技',
      date: '2024-06-22',
      views: '2,300'
    },
    {
      id: 6,
      cat1: '农业节水先进案例',
      cat2: '节水服务',
      name: '高标准农田数字化运营管理',
      content: '结合遥感和物联网技术，提供从种植计划到精准灌溉的一体化服务，助力农业生产提效增产。',
      image: 'https://images.unsplash.com/photo-1495107336039-ab70bf3f972b?auto=format&fit=crop&q=80&w=600',
      region: '河北',
      source: '农业部',
      date: '2024-01-10',
      views: '4,560'
    }
  ];

  const filteredCases = CASES_DATA.filter(item => {
    const match1 = filter1 === '全部' || item.cat1 === filter1;
    const match2 = filter2 === '全部' || item.cat2 === filter2;
    const matchSearch = item.name.includes(searchQuery) || item.content.includes(searchQuery);
    return match1 && match2 && matchSearch;
  });

  if (selectedCase) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[2.5rem] p-10 md:p-20 shadow-sm border border-gray-100"
      >
        <button 
          onClick={() => setSelectedCase(null)}
          className="flex items-center gap-2 text-blue-600 font-black mb-12 hover:gap-3 transition-all"
        >
          <ChevronRight className="w-5 h-5 rotate-180" /> 返回列表
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 text-center mb-8">{selectedCase.name}</h1>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 font-bold mb-12 border-b border-gray-50 pb-8">
             <div className="flex items-center gap-2">
                <span>时间:</span>
                <span className="text-gray-600">{selectedCase.date || '2024-05-12'}</span>
             </div>
             <div className="flex items-center gap-2">
                <span>来源:</span>
                <span className="text-gray-600">{selectedCase.source || '水麒麟节水平台'}</span>
             </div>
          </div>

          <div className="space-y-10">
            {selectedCase.fullContent ? (
              selectedCase.fullContent.map((block: any, i: number) => (
                <div key={i} className="space-y-6">
                  {block.type === 'text' && (
                    <div className="space-y-4">
                      {block.title && <h3 className="text-xl font-black text-gray-800">{block.title}</h3>}
                      <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{block.text}</p>
                    </div>
                  )}
                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={block.url} className="w-full h-auto object-cover" alt="" />
                      </div>
                      <p className="text-center text-sm text-gray-400 font-bold">{block.caption}</p>
                    </div>
                  )}
                </div>
              ))
            ) : selectedCase.fullContentText ? (
              <p className="text-gray-600 leading-[2.2] text-lg whitespace-pre-line text-justify">
                {selectedCase.fullContentText}
              </p>
            ) : (
              <p className="text-gray-600 leading-relaxed text-lg">
                {selectedCase.content}
                <br/><br/>
                暂无更多详细内容展示。
              </p>
            )}
          </div>

          <div className="mt-20 pt-8 border-t border-gray-50 flex justify-end items-center text-sm text-gray-400 font-bold">
             <div className="text-right">
                责任编辑: {selectedCase.author || '闫笑梅'}
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
           <div className="flex-1 relative bg-gray-50 rounded-2xl flex items-center pr-2 border border-transparent focus-within:border-blue-200 transition-all">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索案例名称或内容..."
                className="flex-1 bg-transparent pl-16 pr-6 py-5 text-base focus:outline-none"
              />
           </div>
           <button className="bg-blue-600 text-white px-10 h-16 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
              立即搜索
           </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-6">
             <span className="text-sm font-black text-gray-400 mt-2 shrink-0">应用领域:</span>
             <div className="flex flex-wrap gap-3">
                {primaryCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilter1(cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                      filter1 === cat 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
          <div className="flex items-start gap-6">
             <span className="text-sm font-black text-gray-400 mt-2 shrink-0">二级分类:</span>
             <div className="flex flex-wrap gap-3">
                {secondaryCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilter2(cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                      filter2 === cat 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Case List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCases.map(item => (
          <motion.div 
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group group-hover:-translate-y-1"
          >
            <div className="h-64 overflow-hidden relative">
              <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm text-blue-600 text-[10px] font-black rounded-lg border border-white">
                   {item.cat1}
                 </span>
              </div>
            </div>
            <div className="p-8">
               <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[9px] font-black rounded border border-orange-100 uppercase tracking-widest">{item.cat2}</span>
                  <div className="h-1 w-1 bg-gray-200 rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-bold">
                    <MapPin className="w-3 h-3" />
                    <span>{item.region || '全国'}</span>
                  </div>
               </div>
               <h4 className="text-xl font-black text-gray-800 mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</h4>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                     <Globe className="w-3.5 h-3.5 text-blue-400" />
                     <span className="line-clamp-1">来源: {item.source || '本站'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                     <Calendar className="w-3.5 h-3.5 text-orange-400" />
                     <span>{item.date || '2024-03-22'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                     <MousePointer2 className="w-3.5 h-3.5 text-green-400" />
                     <span>点击: {item.views || '0'}</span>
                  </div>
               </div>

               <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-8 font-medium">
                 {item.content}
               </p>
               <button 
                 onClick={() => setSelectedCase(item)}
                 className="w-full py-4 bg-gray-50 text-gray-800 text-xs font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:shadow-blue-100"
               >
                  查看完整案例内容
               </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredCases.length === 0 && (
        <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-gray-400">暂无匹配的案例内容</h3>
           <p className="text-sm text-gray-300 font-bold mt-2">请尝试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  );
};

// AIDiagnosisCard (Top Right - Matching Screenshot)
const AIDiagnosisCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-blue-600 rounded-2xl p-8 shadow-lg shadow-blue-100 flex items-center justify-between cursor-pointer hover:shadow-2xl hover:-translate-y-0.5 transition-all group relative overflow-hidden h-32"
    >
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <Activity className="w-8 h-8 text-white opacity-80" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black text-white">AI 智能节水诊断</h3>
          </div>
          <p className="text-sm text-blue-100 font-medium">快速输入专业节水建议，精准识别潜力与投资回报</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-10">
        <div className="text-right flex flex-col items-end">
          <p className="text-3xl font-black text-white leading-tight">98.4%</p>
        </div>
        <button className="bg-white text-blue-700 px-10 h-14 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-50 transition-all flex items-center gap-3 border border-transparent">
          立即开始评估 <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// HotProductsCard (Matching Screenshot Style)
const HotProductsCard = () => {
  const carouselProducts = [...PRODUCTS, ...PRODUCTS];

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group relative overflow-hidden text-left border-t-8 border-t-orange-500">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
             <Zap className="w-8 h-8 fill-current" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-gray-800 tracking-tight">热门产品推荐</h3>
             <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Top-Rated Water Saving Equipment</p>
           </div>
        </div>
      </div>

      <div className="relative overflow-hidden group/carousel">
        <motion.div 
          className="flex gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {carouselProducts.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="flex-shrink-0 w-[280px] group/item cursor-pointer flex flex-col items-center">
              <div className={cn(
                "aspect-square w-full mb-6 rounded-3xl overflow-hidden border bg-white p-6 shadow-sm flex items-center justify-center relative group-hover/item:shadow-md transition-all",
                p.name.includes('AI') ? "border-blue-200 shadow-blue-50 ring-4 ring-blue-50" : "border-gray-50"
              )}>
                <img src={p.image} referrerPolicy="no-referrer" className="w-full h-full object-contain group-hover/item:scale-105 transition-transform duration-500" alt={p.name} />
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                   <span className="text-[9px] font-black text-blue-600 bg-blue-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                    {p.category}
                  </span>
                </div>
              </div>
              
              <div className="text-center w-full">
                <h4 className="font-black text-gray-800 text-sm leading-tight group-hover/item:text-blue-600 transition-colors mb-2 line-clamp-1">{p.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold mb-1">场景: {p.scenario}</p>
                <p className="text-[10px] text-gray-500 font-medium line-clamp-2 px-2 leading-relaxed">{p.info}</p>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Fading Edges */}
        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
};


// TechCasesCard (Matching Screenshot Style)
const TechCasesCard = ({ onViewAll }: { onViewAll: () => void }) => {
  const categoryColors: Record<string, string> = {
    "农业": "bg-green-50 text-green-600 border-green-100",
    "工业": "bg-blue-50 text-blue-600 border-blue-100",
    "城镇": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "非常规水": "bg-cyan-50 text-cyan-600 border-cyan-100",
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group relative overflow-hidden text-left border-t-8 border-t-blue-500">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
             <Globe className="w-8 h-8 text-blue-600" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-gray-800 tracking-tight">先进技术案例</h3>
           </div>
        </div>
        <button 
          onClick={onViewAll}
          className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:underline transition-all"
        >
          查看全部案例库 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {TECH_CASES.slice(0, 3).map((c) => (
          <div key={c.id} className="group/item cursor-pointer flex flex-col">
            <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 border border-gray-50 shadow-sm relative transition-all group-hover/item:shadow-xl">
              <img src={c.image} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" alt={c.name} />
              <div className="absolute top-4 left-4">
                 <span className={cn("text-[9px] font-black px-3 py-1 rounded-full border shadow-sm backdrop-blur-md", categoryColors[c.category] || "bg-gray-50 text-gray-600")}>
                  {c.category}
                </span>
              </div>
            </div>
            <h4 className="font-black text-gray-800 text-lg leading-tight group-hover/item:text-blue-600 transition-colors mb-4 line-clamp-2">{c.name}</h4>
            <p className="text-[13px] text-gray-400 line-clamp-3 leading-relaxed flex-1 mb-6">
              {c.description}
            </p>
            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
               <div className="flex -space-x-1.5 opacity-50">
                  {[1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-gray-100" />)}
                  <span className="ml-3 text-[10px] text-gray-300 font-bold uppercase tracking-widest">查看详情...</span>
               </div>
               <TrendingUp className="w-4 h-4 text-blue-200 group-hover/item:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// DemandsTickerCard (Interactive Live Marketplace)
const DemandsTickerCard = () => {
  const [filter, setFilter] = useState<'all' | '农业' | '工业' | '城镇' | '非常规水' | '通用'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time');
  
  // Larger pool of data for the "many demands" feel
  const allDemands = [...DEMANDS, ...DEMANDS, ...DEMANDS].map((d, i) => ({
    ...d,
    id: `d-${i}`,
    // Sprinkle some variation
    likes: d.likes + Math.floor(Math.random() * 50),
    time: i % 3 === 0 ? "刚刚" : d.time
  }));

  const filteredData = allDemands
    .filter(d => filter === 'all' || d.scene === filter)
    .sort((a, b) => sortBy === 'likes' ? b.likes - a.likes : 0);

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group relative overflow-hidden text-left border-t-8 border-t-purple-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
             <MessageSquare className="w-8 h-8 text-purple-600" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-gray-800 tracking-tight">节水需求大厅</h3>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            {['all', '农业', '工业', '城镇', '非常规水', '通用'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-black transition-all whitespace-nowrap",
                  filter === f ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f === 'all' ? '全部' : f}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSortBy('time')}
              className={cn("text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all", sortBy === 'time' ? "text-purple-600 bg-purple-50" : "text-gray-400 hover:bg-gray-100")}
            >
              最新
            </button>
            <button 
              onClick={() => setSortBy('likes')}
              className={cn("text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all", sortBy === 'likes' ? "text-purple-600 bg-purple-50" : "text-gray-400 hover:bg-gray-100")}
            >
              热度
            </button>
          </div>
          <button className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-purple-100 hover:scale-105 transition-all">
            发布需求
          </button>
        </div>
      </div>

      <div className="relative h-[400px] bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
        {/* Decorative Gradients for scrolling feel */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-gray-50/100 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50/100 to-transparent z-10 pointer-events-none" />

        <motion.div 
          animate={{ y: [0, -1000] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="p-6 space-y-4"
        >
          {filteredData.map((d, index) => (
            <div key={`${d.id}-${index}`} className="group/item flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded border uppercase",
                      d.scene === '工业' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      d.scene === '农业' ? "bg-green-50 text-green-600 border-green-100" :
                      d.scene === '城镇' ? "bg-purple-50 text-purple-600 border-purple-100" :
                      d.scene === '非常规水' ? "bg-cyan-50 text-cyan-600 border-cyan-100" :
                      "bg-gray-50 text-gray-500 border-gray-200"
                    )}>
                      {d.scene}专区
                    </span>
                    <span className="text-[10px] text-gray-300 font-bold">{d.time}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base truncate group-hover/item:text-purple-600 transition-colors">
                    “{d.title}”
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-8 shrink-0">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-purple-500">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{d.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>12份方案</span>
                  </div>
                </div>
                <button className="px-5 py-2 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-black opacity-0 group-hover/item:opacity-100 transition-all hover:bg-purple-600 hover:text-white">
                  提供方案
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-8">
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">累计撮合成功</span>
            <span className="text-lg font-black text-purple-600">4,281</span>
         </div>
         <div className="w-px h-4 bg-gray-200" />
         <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Activity className="w-4 h-4 text-green-500" />
            今日新增 128 条真实需求，覆盖全产业链
         </div>
      </div>
    </div>
  );
};


// CloudExhibitionFullBar (Match Bottom Screenshot)
const CloudExhibitionFullBar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer border-4 border-blue-400/20">
      <div className="absolute top-0 right-0 w-[500px] h-full bg-white opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-center gap-10">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-2xl">
              <Store className="w-10 h-10 text-white" />
           </div>
           <div>
              <h3 className="text-4xl font-black italic tracking-tighter text-blue-50 mb-2">云展厅 · 数字孪生成果中心</h3>
              <p className="text-blue-100 opacity-80 text-base font-medium">通过全景视觉，打造全方位产业展示空间，永不落幕的线上博览会</p>
           </div>
        </div>
        <button className="bg-white text-blue-700 px-16 h-16 rounded-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-blue-50 transition-all hover:scale-105 shrink-0 text-lg flex items-center gap-4">
           立即进入展馆 <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// PolicyInfoModule (Integrated Dashboard Style - Matching Screenshot)
const PolicyInfoModule = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'policy' | 'tech'>('news');
  const [subFilter, setSubFilter] = useState<'all' | 'national' | 'local'>('all');

  const tabs = [
    { id: 'news', name: '新闻资讯', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'policy', name: '政策公开', icon: <FileText className="w-4 h-4" /> },
    { id: 'tech', name: '技术标准', icon: <Activity className="w-4 h-4" /> },
  ];

  const activeSubFilterTabs = activeTab === 'tech' 
    ? [
        { id: 'all', name: '全部' },
        { id: 'international', name: '国际标准' },
        { id: 'national_std', name: '国家标准' },
        { id: 'local_std', name: '地方标准' },
        { id: 'industry_std', name: '行业标准' },
        { id: 'group_std', name: '团体标准' },
      ]
    : [
        { id: 'all', name: '全部' },
        { id: 'national', name: '国家' },
        { id: 'local', name: '地方' },
      ];

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-t-8 border-t-blue-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
             <FileText className="w-8 h-8 text-blue-600" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-gray-800 tracking-tight">产业资讯与法规</h3>
           </div>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSubFilter('all');
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-md" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sub-tabs with Search and Date Filter */}
      <div className="flex items-center gap-8 mb-8 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
          {activeSubFilterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubFilter(tab.id as any)}
              className={cn(
                "text-[13px] font-bold transition-all relative py-3 px-1 whitespace-nowrap",
                subFilter === tab.id 
                  ? "text-blue-600 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 py-2 shrink-0">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder={activeTab === 'tech' ? "输入筛选标准" : "输入关键字筛选"} 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all w-32 md:w-44"
              />
           </div>
           <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-all">
              <Calendar className="w-3.5 h-3.5" />
              <span>请选择年份</span>
           </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${subFilter}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
              "grid gap-4",
              activeTab === 'tech' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {activeTab === 'news' && NEWS.map(item => (
              <div key={item.id} className="flex items-center gap-10 p-8 bg-white hover:bg-gray-50/50 border-b border-gray-100 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-blue-600 rounded-none flex flex-col items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                   <FileText className="text-white w-8 h-8 mb-1" />
                   <span className="text-[10px] text-white/90 font-bold tracking-tight">新闻资讯</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-xl leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {["行业动态", "技术创新"].map(tag => (
                      <span key={tag} className="text-[11px] px-3 py-0.5 bg-gray-50 text-gray-400 font-bold rounded-full border border-gray-100">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-gray-400 font-bold mb-1">水麒麟媒体中心</div>
                  <div className="text-[11px] text-gray-300 font-bold">2024-05-09 发布</div>
                </div>
              </div>
            ))}
            {activeTab === 'policy' && POLICIES.map(item => (
               <div key={item.id} className="flex items-center gap-10 p-8 bg-white hover:bg-gray-50/50 border-b border-gray-100 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-blue-600 rounded-none flex flex-col items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                   <FileText className="text-white w-8 h-8 mb-1" />
                   <span className="text-[10px] text-white/90 font-bold tracking-tight">国家政策</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-xl leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {["双碳考核", "十四五规划", "绿色低碳"].slice(0, 2).map(tag => (
                      <span key={tag} className="text-[11px] px-3 py-0.5 bg-blue-50 text-blue-400 font-bold rounded-full border border-blue-100/50">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-black text-gray-400 mb-1">{item.publisher}</div>
                  <div className="text-[11px] text-gray-300 font-bold">{item.time} 发布</div>
                </div>
              </div>
            ))}
            {activeTab === 'tech' && STANDARDS.map(item => (
              <div key={item.id} className="bg-white p-8 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer flex flex-col group relative overflow-hidden">
                <div className="absolute right-2 bottom-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                  <FileText className="w-24 h-24 text-gray-300 transform rotate-12" />
                </div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 font-bold">标准号: {item.code}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-orange-50 text-orange-600 rounded border border-orange-100">团体标准</span>
                </div>
                
                <h4 className="font-bold text-gray-800 text-lg mb-8 leading-tight group-hover:text-blue-600 transition-colors flex items-center flex-wrap gap-x-1">
                  {item.name.replace(/[《》]/g, '')}
                  <ChevronRight className="w-3 h-3 text-gray-300 -rotate-45" />
                </h4>

                <div className="mt-auto flex items-center justify-between text-[11px] font-bold text-gray-400 pb-2">
                  <span>中国标准化研究院</span>
                  <span>{item.time} 发布</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-center">
        <button className="text-gray-400 text-sm font-bold flex items-center gap-3 hover:text-blue-600 transition-colors group">
          进入政策法规全文直通车 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// Global Search Bar Component
const GlobalSearch = () => (
  <section className="bg-white py-8 border-b border-gray-50">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto flex items-stretch shadow-lg rounded-lg overflow-hidden border border-gray-200 divide-x divide-gray-200">
        <div className="bg-gray-100 px-6 flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors font-medium">
          全部 <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
        <div className="flex-1 relative bg-white">
          <input 
            type="text" 
            placeholder="中国专业的节水AI平台" 
            className="w-full h-14 pl-12 pr-4 focus:outline-none text-base placeholder-gray-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button className="bg-[#333] text-white px-10 font-bold hover:bg-black transition-colors">搜索</button>
      </div>
    </div>
  </section>
);

// Auth Modal Component (Login & Register)
const AuthModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  setMode, 
  subMode, 
  setSubMode 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  mode: 'login' | 'register', 
  setMode: (m: 'login' | 'register') => void,
  subMode: 'code' | 'password',
  setSubMode: (s: 'code' | 'password') => void
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[500px] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700"
        >
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-slate-700/50">
            <h2 className="text-xl font-black text-white">{mode === 'login' ? '登录' : '注册'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-10">
            {/* Tabs */}
            <div className="flex gap-10 mb-10 border-b border-slate-700">
              {mode === 'login' ? (
                <>
                  <button 
                    onClick={() => setSubMode('code')}
                    className={cn(
                      "pb-4 text-base font-black transition-all relative",
                      subMode === 'code' ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400" : "text-slate-400 hover:text-slate-300"
                    )}
                  >
                    验证码登录
                  </button>
                  <button 
                    onClick={() => setSubMode('password')}
                    className={cn(
                      "pb-4 text-base font-black transition-all relative",
                      subMode === 'password' ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400" : "text-slate-400 hover:text-slate-300"
                    )}
                  >
                    密码登录
                  </button>
                </>
              ) : (
                <button className="pb-4 text-base font-black text-blue-400 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400">
                  手机号注册
                </button>
              )}
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Phone Input */}
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="输入注册手机号" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {mode === 'login' ? (
                subMode === 'code' ? (
                  /* Verification Code Input */
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="输入验证码" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                    />
                    <button className="px-6 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-blue-500/20 active:scale-95">
                      获取验证码
                    </button>
                  </div>
                ) : (
                  /* Password Input for Login */
                  <>
                    <input 
                      type="password" 
                      placeholder="输入密码" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                    />
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="验证码" 
                        className="flex-1 h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                      />
                      <div className="w-32 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-200 overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors" title="点击刷新">
                        <svg width="100%" height="100%" viewBox="0 0 120 45" className="opacity-70">
                          {/* Noise points */}
                          {Array.from({ length: 40 }).map((_, i) => (
                            <circle key={i} cx={Math.random() * 120} cy={Math.random() * 45} r="0.6" fill={['#3b82f6', '#f97316', '#10b981'][Math.floor(Math.random() * 3)]} opacity="0.5" />
                          ))}
                          {/* Interference lines */}
                          <path d="M0 22 Q 30 12 60 27 T 120 17" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.3" />
                          <path d="M10 40 Q 50 10 90 35" stroke="#f97316" strokeWidth="1.2" fill="none" opacity="0.2" />
                          <path d="M0 10 L 120 35" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.2" />
                          {/* Captcha Text */}
                          <text 
                            x="50%" y="54%" 
                            dominantBaseline="middle" textAnchor="middle" 
                            fontSize="22" fontWeight="900" fill="#334155" 
                            letterSpacing="4" style={{ fontFamily: 'serif', fontStyle: 'italic' }}
                          >
                            S S U S A
                          </text>
                        </svg>
                      </div>
                    </div>
                  </>
                )
              ) : (
                /* Register Fields */
                <>
                  <input 
                    type="password" 
                    placeholder="输入登录密码" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                  />
                  <input 
                    type="password" 
                    placeholder="再次输入登录密码" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                  />
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="输入验证码" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 h-14 bg-white rounded-xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                    />
                    <button className="px-6 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-blue-500/20 active:scale-95">
                      获取验证码
                    </button>
                  </div>
                </>
              )}

              {/* Action Button */}
              <button 
                className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] mt-4"
              >
                {mode === 'login' ? '登录' : '注册'}
              </button>

              {/* Footer Links */}
              <div className="flex items-center justify-between mt-6">
                {mode === 'register' ? (
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                    <div className={cn(
                      "w-4 h-4 rounded-sm border flex items-center justify-center transition-all",
                      agreed ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"
                    )}>
                      {agreed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-400">我已阅读并同意 <span className="text-teal-400 hover:underline">《用户须知》</span></span>
                  </div>
                ) : <div />}

                <button 
                  onClick={() => mode === 'login' ? setMode('register') : setMode('login')}
                  className="text-xs font-bold text-teal-400 hover:underline"
                >
                  {mode === 'login' ? '没有账号，点击注册' : '已有账号，点击登录'}
                  {mode === 'login' && subMode === 'password' && <span className="ml-2 text-slate-400">忘记密码</span>}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


// Identity Selection Component
const IdentitySelection = ({ onSelect, onBack }: { onSelect: (role: 'industry' | 'user') => void, onBack: () => void }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-[3rem]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-black text-slate-800 mb-4">请选择您的入驻身份</h1>
        <p className="text-slate-500 font-bold">根据您的身份选择对应的入口，享受专属服务</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Industry Role */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group cursor-pointer"
          onClick={() => onSelect('industry')}
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Factory className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-red-500">🎯</span> 节水产业企业
          </h3>
          <p className="text-slate-400 font-bold mb-10">设备厂商 / 工程 / 服务商</p>
          
          <ul className="space-y-4 mb-12 text-left w-full px-4">
            {['展示节水产品与技术', '发布节水项目案例', '对接潜在客户需求', '获取政策资讯支持'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
          
          <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            立即入驻
          </button>
        </motion.div>

        {/* User Role */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group cursor-pointer"
          onClick={() => onSelect('user')}
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Droplets className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-blue-500">💧</span> 节水用水户
          </h3>
          <p className="text-slate-400 font-bold mb-10">企业 / 园区 / 学校 / 小区 / 机关</p>
          
          <ul className="space-y-4 mb-12 text-left w-full px-4">
            {['免费节水诊断评估', '智能匹配节水方案', '对接优质节水服务商', '获取政策补贴信息'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
          
          <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            立即入驻
          </button>
        </motion.div>
      </div>

      <button 
        onClick={onBack}
        className="mt-12 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
      >
        <ChevronRight className="w-5 h-5 rotate-180" /> 返回首页
      </button>
    </div>
  );
};

// Enterprise Auth Form Component
const EnterpriseAuthForm = ({ role, onBack }: { role: 'industry' | 'user', onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    creditCode: '',
    name: '',
    region: '',
    regAddress: '',
    actAddress: '',
    industry: '',
    accountName: 'zhangmengyuan62', // 模拟
    contactName: '张孟远', // 模拟
    contactPhone: '138****6688', // 模拟
    email: '',
    userType: '企业法人',
    subType: '内资企业',
    subLevel3: '国有企业',
    scope: '',
    serviceScope: '', // 服务范围、业务范围
    coreProducts: '', // 核心产品或方案
    industryType: '', // 节水产业类型
    products: '',
    isAboveSize: '是',
    scale: '中型企业'
  });

  const [files, setFiles] = useState<File[]>([]);

  // 模拟企查查数据带出
  const fetchQichachaData = async (code: string) => {
    if (code.length < 18) return;
    setLoading(true);
    // 模拟延迟
    setTimeout(() => {
      setFormData((prev: any) => ({
        ...prev,
        creditCode: code,
        name: '江苏省水利工程科技咨询股份有限公司',
        region: '江苏省南京市',
        regAddress: '南京市上海路5号水利大厦15楼',
        actAddress: '南京市上海路5号水利大厦15楼',
        industry: '水利、环境和公共设施管理业',
        scope: '水利工程建设监理；水文学及水资源调查；水库大坝安全分析评价；水资源论证、水环境监测；节约用水、水务精细化管理技术咨询、系统开发；智慧水利系统集成；工程设计与技术咨询服务。',
        serviceScope: '水利管理咨询、节水评估、数字化系统集成',
        coreProducts: '智慧节水管理云平台、非接触式超声波流量计',
        scale: '大中型',
        isAboveSize: '是'
      }));
      setLoading(false);
    }, 1500);
  };

  const userTypeOptions: any = {
    '企业法人': [
      { label: '内资企业', children: ['国有企业', '私营企业', '集体企业', '联营企业', '其他内资企业'] },
      { label: '港澳台商投资企业', children: [] },
      { label: '外商投资企业', children: [] },
      { label: '其他类型企业', children: [] }
    ],
    '非企业法人': [
      { label: '机关法人', children: [] },
      { label: '事业单位', children: [] },
      { label: '社会团体', children: [] },
      { label: '其他类型法人', children: [] }
    ]
  };

  const industryProducts: any = {
    '1': ['智能防洪闸门', '水情监测终端', '数字孪生水利平台', '工程安全监测仪'],
    '2': ['高效节水喷头', '智能配水阀门', '自动化灌区网关', '土壤水分传感器'],
    '3': ['工业循环水处理器', '中水回用膜组件', '高精度流量计', '智慧水务MES系统'],
    'default': ['智能水表', '高效节水灌溉系统', '循环水处理装置', '智慧节水监控平台', '低压输水管网']
  };

  const [industryId, setIndustryId] = useState('');
  const currentProductSuggestions = industryProducts[industryId] || industryProducts.default;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">企业认证</h2>
            <p className="text-slate-400 text-sm font-bold mt-1">请填写以下信息完成{role === 'industry' ? '产业企业' : '用水户'}认证</p>
          </div>
          <button onClick={onBack} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-10 space-y-12">
          {/* Main Identity Info */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-black text-slate-800">主体身份信息</h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-black rounded uppercase">必填项</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Credit Code */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600 flex items-center gap-2">
                  统一社会信用代码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.creditCode}
                    onChange={(e) => {
                      setFormData({...formData, creditCode: e.target.value});
                      if(e.target.value.length === 18) fetchQichachaData(e.target.value);
                    }}
                    placeholder="请输入18位信用代码"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-500 font-bold text-xs">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      企查查查验中...
                    </div>
                  )}
                </div>
              </div>

              {/* Name (Auto) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">用户名称</label>
                <input 
                  disabled 
                  value={formData.name}
                  className="w-full h-14 bg-slate-100/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Region (Auto) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">所属区域</label>
                <input 
                  disabled 
                  value={formData.region}
                  className="w-full h-14 bg-slate-100/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Reg Address (Auto) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">注册地址</label>
                <input 
                  disabled 
                  value={formData.regAddress}
                  className="w-full h-14 bg-slate-100/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actual Address */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600">实际地址</label>
              <input 
                value={formData.actAddress}
                onChange={(e) => setFormData({...formData, actAddress: e.target.value})}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800"
              />
            </div>
          </section>

          {/* Contact Info */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-teal-500 pl-4">
              <h3 className="text-lg font-black text-slate-800">联系人及账号信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">账号名称</label>
                <input disabled value={formData.accountName} className="w-full h-14 bg-slate-100/50 rounded-2xl px-6 font-bold text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">联系人姓名</label>
                <input disabled value={formData.contactName} className="w-full h-14 bg-slate-100/50 rounded-2xl px-6 font-bold text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">联系电话</label>
                <input disabled value={formData.contactPhone} className="w-full h-14 bg-slate-100/50 rounded-2xl px-6 font-bold text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">联系邮箱 <span className="text-red-500">*</span></label>
                <input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="请输入邮箱以便接收通知"
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800 focus:border-teal-500 transition-all" 
                />
              </div>
            </div>
          </section>

          {/* Detailed Classification */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-black text-slate-800">业务信息</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* User Type */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">用水户类型 <span className="text-red-500">*</span></label>
                <select 
                  value={formData.userType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const firstSubType = userTypeOptions[newType][0];
                    setFormData({
                      ...formData, 
                      userType: newType, 
                      subType: firstSubType.label,
                      subLevel3: firstSubType.children.length > 0 ? firstSubType.children[0] : ''
                    });
                  }}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800 focus:border-orange-500 outline-none"
                >
                  <option value="企业法人">企业法人</option>
                  <option value="非企业法人">非企业法人</option>
                </select>
              </div>

              {/* Cascade Sub Type */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">单位性质</label>
                <select 
                  value={formData.subType}
                  onChange={(e) => {
                    const newSub = e.target.value;
                    const group = userTypeOptions[formData.userType].find((g: any) => g.label === newSub);
                    setFormData({
                      ...formData, 
                      subType: newSub,
                      subLevel3: group.children.length > 0 ? group.children[0] : ''
                    });
                  }}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800 focus:border-orange-500 outline-none"
                >
                  {userTypeOptions[formData.userType].map((group: any) => (
                    <option key={group.label} value={group.label}>{group.label}</option>
                  ))}
                </select>
              </div>

              {/* Level 3 Cascade if exists */}
              {userTypeOptions[formData.userType].find((g: any) => g.label === formData.subType)?.children.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600">细分类型</label>
                  <select 
                    value={formData.subLevel3}
                    onChange={(e) => setFormData({...formData, subLevel3: e.target.value})}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-800 focus:border-orange-500 outline-none"
                  >
                    {userTypeOptions[formData.userType].find((g: any) => g.label === formData.subType).children.map((child: string) => (
                      <option key={child} value={child}>{child}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Industry Cascade Mockup */}
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-600">所属行业 (四级联动：门类/大类/中类/小类)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['门类', '大类', '中类', '小类'].map((level) => (
                  <select 
                    key={level} 
                    onChange={(e) => {
                      if (level === '门类') {
                        setIndustryId(e.target.value);
                        setFormData({...formData, products: ''});
                      }
                    }}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-slate-800 outline-none focus:border-blue-400"
                  >
                    <option value="">请选择{level}</option>
                    <option value="1">水利管理业</option>
                    <option value="2">农业灌溉</option>
                    <option value="3">工业用水</option>
                  </select>
                ))}
              </div>
            </div>

            {/* Added: Water-Saving Industry Type */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600">节水产业类型 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {['农业节水', '工业节水', '城镇生活节水', '非常规水利用', '节水数字化', '节水服务'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, industryType: type})}
                    className={cn(
                      "h-12 rounded-xl text-[10px] font-black transition-all border-2",
                      formData.industryType === type
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]"
                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {formData.userType === '企业法人' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-8 pt-4"
              >
                {/* Major Product Name - Interactive Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-600 px-1 flex items-center gap-2">
                    主要产品名称 
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">优先从行业库选择</span>
                  </label>
                  <div className="relative group">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Left: Dropdown from library */}
                      <div className="w-full md:w-64 relative group/select">
                        <select 
                          className="w-full h-14 bg-blue-50 border-2 border-blue-100 rounded-2xl px-4 pr-10 font-black text-blue-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm transition-all text-sm"
                          onChange={(e) => setFormData({...formData, products: e.target.value})}
                          value={currentProductSuggestions.includes(formData.products) ? formData.products : ""}
                        >
                          <option value="">从行业库直接选择...</option>
                          {currentProductSuggestions.map((p: string) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        {currentProductSuggestions.includes(formData.products) && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({...formData, products: ''});
                            }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-100 rounded-xl text-blue-400 transition-colors z-10 shadow-sm bg-white/50 backdrop-blur-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Right: Manual input */}
                      <div className="flex-1 relative">
                        <input 
                          value={formData.products}
                          onChange={(e) => setFormData({...formData, products: e.target.value})}
                          placeholder="若库中没有，请在此手动输入产品名称"
                          className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-800 focus:border-blue-500 transition-all shadow-sm" 
                        />
                        {formData.products && (
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, products: ''})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600 flex items-center gap-2">
                    生产经营范围
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100/50">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                      企查查自动同步
                    </span>
                  </label>
                  <textarea 
                    value={formData.scope}
                    disabled
                    placeholder="输入信用代码后自动带入..."
                    className="w-full h-32 bg-slate-100/50 border border-slate-100 rounded-2xl p-6 font-bold text-slate-500 resize-none shadow-inner"
                  />
                </div>

                {/* Added: Service Range and Core Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-600 px-1">服务范围、业务范围 <span className="text-red-500">*</span></label>
                    <textarea 
                      value={formData.serviceScope}
                      onChange={(e) => setFormData({...formData, serviceScope: e.target.value})}
                      placeholder="请输入主要业务覆盖范围..."
                      className="w-full h-32 bg-white border-2 border-slate-100 rounded-2xl p-6 font-bold text-slate-800 focus:border-blue-500 transition-all shadow-sm resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-600 px-1">核心产品或方案 <span className="text-red-500">*</span></label>
                    <textarea 
                      value={formData.coreProducts}
                      onChange={(e) => setFormData({...formData, coreProducts: e.target.value})}
                      placeholder="请输入最具竞争力的核心产品或解决方案..."
                      className="w-full h-32 bg-white border-2 border-slate-100 rounded-2xl p-6 font-bold text-slate-800 focus:border-blue-500 transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-600 text-slate-600">是否规上企业</label>
                    <select value={formData.isAboveSize} onChange={(e) => setFormData({...formData, isAboveSize: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold">
                       <option value="是">是</option>
                       <option value="否">否</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-600 px-1">企业规模</label>
                    <input disabled value={formData.scale} className="w-full h-14 bg-slate-100/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-500" />
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* Attachments */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-slate-800 pl-4">
              <h3 className="text-lg font-black text-slate-800">授权与证明文件</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Power of Attorney */}
              <div className="flex flex-col h-full">
                <label className="text-sm font-black text-slate-500 mb-4 px-1 flex items-center justify-between">
                  <span>授权委托书 <span className="text-red-500">*</span></span>
                  <button className="text-blue-500 text-xs hover:underline flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> 下载模板
                  </button>
                </label>
                <div className="flex-1 min-h-[16rem] border-2 border-dashed border-slate-200 rounded-[2rem] p-8 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-black">点击或拖拽上传</p>
                    <p className="text-slate-400 text-[11px] font-bold mt-1 leading-relaxed">支持PDF、JPG图片<br/>文件大小 10MB 以内</p>
                  </div>
                </div>
              </div>

              {/* Business License */}
              <div className="flex flex-col h-full">
                <label className="text-sm font-black text-slate-500 mb-4 px-1">营业执照/登记证书/法人证书/信用代码证书 <span className="text-red-500">*</span></label>
                <div className="flex-1 min-h-[16rem] border-2 border-dashed border-slate-200 rounded-[2rem] p-8 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                    <Image className="w-8 h-8 text-slate-400 group-hover:text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-black">上传证照扫描件</p>
                    <p className="text-slate-400 text-[11px] font-bold mt-1">请确保内容清晰可见<br/>且在有效期内</p>
                  </div>
                </div>
              </div>

              {/* ID Card Wrapper */}
              <div className="flex flex-col h-full">
                <label className="text-sm font-black text-slate-500 mb-4 px-1">委托人身份证 <span className="text-red-500">*</span></label>
                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-4 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer group flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                      <UserCheck className="w-7 h-7 text-slate-400 group-hover:text-orange-500" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-black text-sm">上传人像面</p>
                      <p className="text-slate-400 text-[11px] font-bold">身份证正面照片</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-4 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                      <ShieldCheck className="w-7 h-7 text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-black text-sm">上传国徽面</p>
                      <p className="text-slate-400 text-[11px] font-bold">身份证背面照片</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-10 flex gap-6">
            <button className="flex-1 h-16 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98]">
              提交认证申请
            </button>
            <button className="w-32 h-16 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Layout
export default function App() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    subMode: 'code' | 'password';
  }>({
    isOpen: false,
    mode: 'login',
    subMode: 'code'
  });
  const [currentRole, setCurrentRole] = useState(ROLES[0]);
  const [currentView, setCurrentView] = useState<'home' | 'policy' | 'exhibition' | 'forum' | 'cases' | 'industry-login' | 'industry-dashboard' | 'industry-identity' | 'industry-auth'>('home');
  const [authRole, setAuthRole] = useState<'industry' | 'user' | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<any>(null);

  const EXHIBITIONS = [
    {
      id: 1,
      name: "大禹节水智慧展厅",
      company: "大禹节水集团股份有限公司",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      description: "专注于农业智慧节水、农村生活污水处理、城乡供水一体化等领域的全产业链综合服务商。",
      tags: ["智慧农业", "节水装备", "水权交易"],
      rating: 4.9,
      visits: "12.5k"
    },
    {
      id: 2,
      name: "威派格智慧水务馆",
      company: "上海威派格智慧水务股份有限公司",
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=800",
      description: "集工业互联网理念于一体的智慧水务解决方案提供商，致力于解决供水最后1公里的安全问题。",
      tags: ["智慧水务", "工业互联网", "泵站管理"],
      rating: 4.8,
      visits: "8.2k"
    },
    {
      id: 3,
      name: "博世科节能环保展区",
      company: "广西博世科环保科技股份有限公司",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
      description: "提供核心装备制造、系统整合、工程承包及运行维护的一站式绿色环保服务。",
      tags: ["工业污水", "水土修复", "节能减排"],
      rating: 4.7,
      visits: "5.9k"
    },
    {
      id: 4,
      name: "苏科环保膜技术馆",
      company: "苏科环保技术有限责任公司",
      image: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?auto=format&fit=crop&q=80&w=800",
      description: "拥有自主知识产权的膜生物反应器（MBR）技术，专注于高品质水处理设备。",
      tags: ["膜技术", "水再生", "关键材料"],
      rating: 4.9,
      visits: "10.1k"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 font-sans">
      <Navbar 
        currentRole={currentRole} 
        onRoleChange={(r) => setCurrentRole(r)} 
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v as any);
          window.scrollTo(0, 0);
        }}
        onAuthClick={(mode) => setAuthModal({ isOpen: true, mode, subMode: 'code' })}
      />
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal(prev => ({ ...prev, mode }))}
        subMode={authModal.subMode}
        setSubMode={(subMode) => setAuthModal(prev => ({ ...prev, subMode }))}
      />
      <GlobalSearch onSearch={(v) => console.log(v)} />
      
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-[1440px] mx-auto px-6 py-10 flex gap-8 items-stretch">
              <div className="w-64 shrink-0 top-32 sticky h-auto self-stretch z-30">
                 <VerticalCategories />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-10">
                 <AIDiagnosisCard onClick={() => setIsAiModalOpen(true)} />
                 <HotProductsCard />
              </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 pb-20 space-y-12">
                 <DemandsTickerCard />
                 <TechCasesCard onViewAll={() => setCurrentView('cases')} />
                 <div className="space-y-6">
                    <PolicyInfoModule />
                    <div onClick={() => setCurrentView('exhibition')} className="cursor-pointer">
                       <CloudExhibitionFullBar />
                    </div>
                 </div>
            </div>
          </motion.div>
        )}

        {currentView === 'industry-login' && (
          <motion.div
            key="industry-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-[1440px] mx-auto px-6"
          >
             <IndustryLogin onLogin={() => setCurrentView('industry-dashboard')} />
          </motion.div>
        )}

        {currentView === 'industry-dashboard' && (
          <motion.div
            key="industry-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1440px] mx-auto px-6 py-10"
          >
             <IndustryDashboard onLogout={() => setCurrentView('industry-login')} />
          </motion.div>
        )}

        {currentView === 'cases' && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1440px] mx-auto px-6 py-10"
          >
             <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setCurrentView('home')}
                     className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all group"
                   >
                     <ChevronRight className="w-5 h-5 rotate-180" />
                   </button>
                   <div>
                      <h2 className="text-3xl font-black text-gray-800 tracking-tight">先进节水案例库</h2>
                      <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Advanced Water-Saving Case Repository</p>
                   </div>
                </div>
             </div>
             <CasesModule />
          </motion.div>
        )}

        {currentView === 'industry-identity' && (
          <IdentitySelection 
            onSelect={(role) => {
              setAuthRole(role);
              setCurrentView('industry-auth');
            }} 
            onBack={() => setCurrentView('home')} 
          />
        )}

        {currentView === 'industry-auth' && (
          <EnterpriseAuthForm 
            role={authRole!} 
            onBack={() => setCurrentView('industry-identity')} 
          />
        )}

        {currentView === 'policy' && (
          <motion.div
            key="policy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1440px] mx-auto px-6 py-10"
          >
             <div className="mb-10 flex items-center gap-4">
                <button 
                  onClick={() => setCurrentView('home')}
                  className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all group"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div>
                   <h2 className="text-3xl font-black text-gray-800 tracking-tight">政策法规与信息公开</h2>
                   <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Policy & Regulations</p>
                </div>
             </div>
             <PolicyInfoModule />
          </motion.div>
        )}

        {currentView === 'forum' && (
          <motion.div
            key="forum"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1440px] mx-auto px-6 py-10"
          >
             <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setCurrentView('home')}
                     className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all group"
                   >
                     <ChevronRight className="w-5 h-5 rotate-180" />
                   </button>
                   <div>
                      <h2 className="text-3xl font-black text-gray-800 tracking-tight">交流合作与供需中心</h2>
                      <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Community & Collaboration Hub</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-gray-50 object-cover shadow-sm" alt="" />
                      ))}
                   </div>
                   <span className="text-xs font-black text-gray-400 ml-4">+2,500 位用户在线交流</span>
                </div>
             </div>
             <ForumModule />
          </motion.div>
        )}

        {currentView === 'exhibition' && (
          <motion.div
            key="exhibition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1440px] mx-auto px-6 py-10"
          >
             <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                        if (selectedExhibition) setSelectedExhibition(null);
                        else setCurrentView('home');
                    }}
                    className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all group"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                        {selectedExhibition ? "企业云展厅详情" : "智慧节水云展中心"}
                    </h2>
                    <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">
                        {selectedExhibition ? "Exhibition Details" : "Virtual Exhibition Mall"}
                    </p>
                  </div>
                </div>

                {!selectedExhibition && (
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-1.5 flex shadow-sm">
                      {['全部展厅', '知名企业', '高新技术', '节水标杆'].map((t, i) => (
                        <button key={t} className={cn(
                          "px-6 py-2 rounded-xl text-xs font-black transition-all",
                          i === 0 ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-gray-400 hover:text-gray-600"
                        )}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             {selectedExhibition ? (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
                        <img src={selectedExhibition.image} className="w-full h-[500px] object-cover" alt="" />
                        <div className="p-10">
                           <div className="flex items-center gap-4 mb-8">
                              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-black rounded-full border border-blue-100 uppercase tracking-wider">3D云展厅</span>
                              <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-black rounded-full border border-orange-100">在线洽谈</span>
                           </div>
                           <h3 className="text-4xl font-black text-gray-800 mb-6">{selectedExhibition.name}</h3>
                           <p className="text-lg text-gray-500 leading-relaxed font-medium">{selectedExhibition.description}</p>
                           
                           <div className="mt-12 grid grid-cols-3 gap-8 py-8 border-y border-gray-100">
                              <div className="text-center">
                                 <div className="text-3xl font-black text-blue-600 mb-1">99%</div>
                                 <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">满意度评分</div>
                              </div>
                              <div className="text-center border-x border-gray-50 px-8">
                                 <div className="text-3xl font-black text-gray-800 mb-1">{selectedExhibition.visits}</div>
                                 <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">累计访问量</div>
                              </div>
                              <div className="text-center">
                                 <div className="text-3xl font-black text-gray-800 mb-1">56+</div>
                                 <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">核心技术点</div>
                              </div>
                           </div>

                           <div className="mt-12 flex gap-4">
                              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3">
                                 <Zap className="w-5 h-5 fill-white" />
                                 立即进入3D展厅
                              </button>
                              <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 font-black py-5 rounded-2xl border border-gray-200 transition-all">
                                 联系入驻
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-lg">
                        <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                           <Store className="w-5 h-5 text-blue-600" />
                           公司详情
                        </h4>
                        <div className="space-y-6">
                           <div>
                              <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-2">企业名称</label>
                              <p className="text-sm font-black text-gray-700">{selectedExhibition.company}</p>
                           </div>
                           <div>
                              <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-2">所属行业</label>
                              <p className="text-sm font-black text-gray-700">智慧节水 / 智慧农业</p>
                           </div>
                           <div>
                              <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-2">入驻时间</label>
                              <p className="text-sm font-black text-gray-700">2023年05月12日</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100/50">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                           <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-xl font-black mb-4">商业机会连接</h4>
                        <p className="text-blue-50/80 text-sm font-medium leading-relaxed mb-8">
                           通过大数据精准匹配，该企业的节水技术已成功对接214项实际项目需求。
                        </p>
                        <button className="w-full bg-white text-blue-600 font-black py-4 rounded-xl shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform">
                           获取技术白皮书
                        </button>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {EXHIBITIONS.map(hall => (
                    <div 
                      key={hall.id} 
                      onClick={() => setSelectedExhibition(hall)}
                      className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all cursor-pointer group"
                    >
                       <div className="relative h-64 overflow-hidden">
                          <img src={hall.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                             <div className="text-white text-xs font-black">点击进入数字化交互空间</div>
                          </div>
                       </div>
                       <div className="p-8">
                          <div className="flex items-center gap-2 mb-4">
                             {hall.tags.map(tag => (
                               <span key={tag} className="text-[10px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded border border-gray-100">{tag}</span>
                             ))}
                          </div>
                          <h4 className="text-xl font-black text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{hall.name}</h4>
                          <p className="text-xs text-gray-400 font-bold mb-6 line-clamp-1">{hall.company}</p>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                             <div className="flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-black text-blue-600">展厅活跃中</span>
                             </div>
                             <div className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                查看详情
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                  
                  {/* Empty Slot / "Joining Soon" */}
                  <div className="bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center group cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-gray-300 group-hover:text-blue-400" />
                     </div>
                     <h4 className="text-lg font-black text-gray-400 group-hover:text-blue-600">入驻云展厅</h4>
                     <p className="text-xs text-gray-300 font-bold mt-2">展示您的数字化节水实力</p>
                  </div>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-6">

        {/* Footer info from image */}
        <footer className="mt-12 border-t border-gray-100 pt-16 pb-8">
           <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                       <Droplets className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col leading-none">
                       <span className="text-2xl font-black text-gray-800 tracking-tighter">水麒麟</span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">水麒麟产业</span>
                    </div>
                 </div>
                 <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                   引领中国节水产业数字化新基建。汇集顶尖设备商、技术服务商与科研机构，为您提供一站式节水供需对接服务。
                 </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                 <div className="space-y-4">
                    <h5 className="font-bold text-gray-800 flex items-center gap-2">平台功能 <ChevronRight className="w-3 h-3 rotate-90 text-blue-600" /></h5>
                    <ul className="space-y-2 text-sm text-gray-400">
                       <li><a href="#" className="hover:text-blue-600">AI 智能诊断</a></li>
                       <li><a href="#" className="hover:text-blue-600">云展厅装修</a></li>
                       <li><a href="#" className="hover:text-blue-600">供需对接市场</a></li>
                    </ul>
                 </div>
                 <div className="space-y-4 text-center md:text-right col-span-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">服务热线</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter italic">400-888-1234</p>
                    <div className="flex justify-center md:justify-end gap-6 text-[10px] text-gray-300 font-medium">
                       <span>隐私政策</span>
                       <span>服务条款</span>
                       <span>ICP备12345678号</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="mt-16 pt-8 border-t border-gray-50 text-center text-[10px] text-gray-300 font-bold tracking-widest uppercase">
              © 2026 广西水麒麟节水产业数字化服务平台. 版权所有.
           </div>
        </footer>
      </div>

      {/* Floating Diagnosis Toggle */}
      <button 
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-40 group hover:shadow-blue-200"
      >
        <Activity className="w-8 h-8" />
        <div className="absolute -top-12 right-0 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          AI 诊断
        </div>
      </button>

      <AIDiagnosisModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
}

