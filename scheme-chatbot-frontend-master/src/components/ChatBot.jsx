import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiSendPlaneFill } from "react-icons/ri";
import { FiChevronDown } from 'react-icons/fi';
import Modal from './Modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSkeleton from './LoadingSkeleton';

const ChatBot = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState('');
    const [schemes, setSchemes] = useState([]);
    const [features, setFeatures] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch schemes when component mounts
    useEffect(() => {
        async function fetchSchemes() {
            try {
                const response = await axios.get('http://localhost:5000/api/schemes');
                setSchemes(response.data);
            } catch (error) {
                console.error('Error fetching schemes:', error);
            }
        }
        async function fetchFeatures(){
            try{
                const response = await axios.get('http://localhost:5000/api/features')
                setFeatures(response.data);
                console.log(features);
            }
            catch(error){
                console.log('Error Fetching features:', error);
            }
        }

        fetchSchemes();
        fetchFeatures();
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;

        const newMessage = { text: message, sender: 'user' };
        setChatHistory([...chatHistory, newMessage]);
        const messageToGemini = message;
        setIsLoading(true)
        setMessage('');


        try {
            const response = await axios.post('http://localhost:5000/api/chat/ask', {
                query: messageToGemini,
                schemeId: selectedScheme
            });
            setIsLoading(false);

            const botMessage = { text: response.data.answer, sender: 'bot' };
            setChatHistory(prevHistory => [...prevHistory, botMessage]);
        } catch (error) {
            console.error('Error fetching response:', error);
            setIsLoading(false);
            const botMessage = { text: 'An error occurred while fetching the response.', sender: 'bot' };
            setChatHistory(prevHistory => [...prevHistory, botMessage]);
        }


        
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    const handleSchemeChange = (e) => {
        setSelectedScheme(e.target.value);
        setChatHistory([]); // Clear chat history when a new scheme is selected
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Custom markdown components for bot responses
    const markdownComponents = {
        // Table enhancements with better structure and hover effects
        table: ({...props}) => (
          <div className="w-full overflow-x-auto my-6 rounded-lg shadow-md">
            <table className="w-full border-collapse text-left" {...props} />
          </div>
        ),
        thead: ({...props}) => <thead className="bg-blue-50" {...props} />,
        tbody: ({...props}) => <tbody className="divide-y divide-gray-200" {...props} />,
        tr: ({...props}) => <tr className="hover:bg-blue-50 transition-colors duration-200" {...props} />,
        th: ({...props}) => <th className="px-4 py-3 font-medium text-blue-500 border-b-2 border-blue-300" {...props} />,
        td: ({...props}) => <td className="px-4 py-3 text-gray-700 border-b border-gray-100" {...props} />,
        
        // Enhanced headings with subtle gradient underlines
        h1: ({...props}) => (
          <h1 className="text-3xl font-bold mt-6 mb-4 text-blue-700 pb-1 border-b-2 border-blue-200" {...props} />
        ),
        h2: ({...props}) => (
          <h2 className="text-2xl font-bold mt-5 mb-3 text-blue-600 pb-1 border-b border-blue-100" {...props} />
        ),
        h3: ({...props}) => (
          <h3 className="text-xl font-bold mt-4 mb-2 text-blue-600" {...props} />
        ),
        
        // Better paragraph spacing
        p: ({...props}) => <p className="my-4 text-gray-800 leading-relaxed" {...props} />,
        
        // Enhanced lists with better spacing and bullets
        ul: ({...props}) => <ul className="list-disc ml-6 my-4 space-y-2 text-gray-800" {...props} />,
        ol: ({...props}) => <ol className="list-decimal ml-6 my-4 space-y-2 text-gray-800" {...props} />,
        li: ({...props}) => <li className="ml-2 pl-1" {...props} />,
        
        // Better link styling with transition effects
        a: ({href, ...props}) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors duration-200"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props} 
          />
        ),
        
        // Enhanced blockquotes with gradient border
        blockquote: ({...props}) => (
          <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 my-4 text-gray-700 italic rounded-r-md" {...props} />
        ),
        
        // Better code styling with syntax highlights
        code: ({inline, ...props}) => {
          return inline 
            ? <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-sm" {...props} /> 
            : (
              <div className="relative">
                <pre className="rounded-md bg-gray-50 p-4 my-4 overflow-x-auto border border-gray-200">
                  <code className="font-mono text-blue-700 text-sm" {...props} />
                </pre>
              </div>
            );
        },
        
        // Enhanced emphasis and strong
        em: ({...props}) => <em className="italic text-blue-700" {...props} />,
        strong: ({...props}) => <strong className="font-bold text-blue-900" {...props} />,
        
        // Additional enhancements for other elements
        hr: ({...props}) => <hr className="my-8 border-t-2 border-gray-200" {...props} />,
        img: ({src, alt, ...props}) => (
          <img 
            src={src} 
            alt={alt || ''} 
            className="max-w-full h-auto rounded-lg shadow-md my-4" 
            {...props} 
          />
        ),
        
        // Definition list improvements
        dl: ({...props}) => <dl className="my-4" {...props} />,
        dt: ({...props}) => <dt className="font-bold text-blue-700 mt-4" {...props} />,
        dd: ({...props}) => <dd className="ml-4 mb-4 text-gray-700" {...props} />
      };

    // Auto-scroll to the bottom of chat history
    useEffect(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    return (
        <div className="relative flex flex-col xl:h-[87vh] bg-gray-100">
            {/* Scheme selection dropdown */}
            <div className="absolute left-0 top-0 w-full flex justify-start space-x-3 bg-white p-4">
                <div className="relative">
                    <select
                        className="appearance-none bg-[#151B2F] text-white rounded-lg focus:outline-none px-4 py-2 font-semibold text-sm"
                        value={selectedScheme}
                        onChange={handleSchemeChange}
                    >
                        <option value="">Select Scheme</option>
                        {schemes.map((scheme) => (
                            <option key={scheme.id} value={scheme.id}>
                                {scheme.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <FiChevronDown className="text-white" />
                    </div>
                </div>
                <div className="">
                    <button disabled={selectedScheme===''} onClick={openModal} className='px-6 py-2 bg-[#151B2F] text-sm font-semibold rounded-lg text-white'>Quick Info</button>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-14 chat-container bg-white">
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        className={`p-2 my-2 flex text-sm rounded-lg ${
                            chat.sender === 'user' ? 'justify-end text-end' : 'justify-start w-[95%] text-start'
                        }`}
                    >
                        <div className={`px-5 py-4 rounded-lg ${chat.sender === 'user' ? 'bg-[#E6F2FE] w-fit' : 'bg-[#F0F4F9]'}`}>
                            {chat.sender === 'bot' ? (
                                <div className="markdown-response">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={markdownComponents}
                                    >
                                        {chat.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                chat.text
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Loading Skeleton */}
                {isLoading && (
                    <LoadingSkeleton />
                )}
            </div>

            {/* Input Box */}
            <div className="sticky bottom-0 bg-white p-4">
                <div className="flex items-center">
                    <input
                        type="text"
                        className="flex-1 bg-[#F4F4F4] border focus:outline-none border-gray-300 rounded-full py-[11px] text-sm px-4 mr-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <button
                        className={`bg-gradient-to-b from-[#014CD3] to-[#256FEF] text-white text-xl rounded-full px-3 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleSend}
                        disabled={isLoading}
                    >
                        <RiSendPlaneFill />
                    </button>
                </div>
            </div>
            <Modal data={features[selectedScheme]} isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default ChatBot;