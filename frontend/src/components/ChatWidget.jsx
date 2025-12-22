import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTheme } from '../hooks/useTheme';
import { chatApi } from '../lib/api';

const ChatWidget = () => {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am Apna Doctor. How can I help you regarding your health today?' }
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || loading) return;

        const userMsg = { role: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setLoading(true);

        try {
            const history = messages.slice(-6);
            const res = await chatApi.send(userMsg.text, history);
            
            const aiMsg = { role: 'ai', text: res.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className={`mb-4 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border animate-in slide-in-from-bottom-5 fade-in duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                             <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot className="h-5 w-5" />
                             </div>
                             <div>
                                <h3 className="font-bold text-sm">Apna Doctor</h3>
                                <p className="text-[10px] opacity-80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                                </p>
                             </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className={`h-80 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 mt-1">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                      ? 'bg-blue-600 text-white rounded-br-none' 
                                      : isDark ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' : 'bg-white text-slate-700 rounded-bl-none shadow-sm border border-slate-100'
                                }`}>
                                   {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 mt-1">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className={`px-4 py-2 rounded-2xl rounded-bl-none ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <Input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask health questions..." 
                            className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-transparent'}`}
                        />
                        <Button type="submit" size="icon" disabled={loading || !inputText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <Button 
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-110 transition-transform duration-200 shadow-xl shadow-blue-500/30 flex items-center justify-center"
                >
                    <MessageSquare className="h-7 w-7 text-white" />
                </Button>
            )}
        </div>
    );
};

export default ChatWidget;
