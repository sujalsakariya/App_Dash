import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, MoreVertical } from 'lucide-react';

export default function EmailSupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    problem: ''
  });
  const messagesEndRef = useRef(null);
  
  // Initial welcome message from the bot
  useEffect(() => {
    const initialMessage = {
      id: 'initial-1',
      sender: 'bot',
      text: 'Hi there! I\'m the Bytesphere Virtual Assistant. How can I help you today? 😊',
      time: getCurrentTime(),
      isInitial: true
    };
    
    // Initial options
    const optionsMessage = {
      id: 'options-1',
      sender: 'bot',
      time: getCurrentTime(),
      options: [
        'Can\'t Receive Emails',
        'Can\'t Send Emails',
        'Login or Password Issues',
        'Forgot Password',
        'Spam or Junk Mail Problems',
        'Email Settings Help',
        'Blocked/Suspended Account',
        'Email Not Syncing',
        'Change Email Address',
        'Contact Email Support'
      ],
      isVisible: true
    };
    
    setMessages([initialMessage, optionsMessage]);
    updateCurrentTime();
    
    // Update time every minute
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    // Add a small delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);
  
  function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    setCurrentTime(formattedTime);
  }
  
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  }
  
  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
  
  function toggleChat() {
    setIsOpen(!isOpen);
  }
  
  function handleContactInput(field, value) {
    setContactFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
  
  function handleContactSubmit() {
    // Hide the contact form first
    setMessages(prev => prev.map(msg => 
      msg.isContactForm ? { ...msg, isVisible: false } : msg
    ));
    
    // Add form submission message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Contact request submitted:\nName: ${contactFormData.name}\nEmail: ${contactFormData.email}\nProblem: ${contactFormData.problem}`,
      time: getCurrentTime()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate sending email to doublemail06@gmail.com
    setTimeout(() => {
      const botResponse = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Thank you for contacting us! Your request has been sent to our support team. We'll get back to you as soon as possible at the email address you provided.",
        time: getCurrentTime()
      };
      
      const optionsMessage = {
        id: `options-${Date.now()}`,
        sender: 'bot',
        options: [
          'Can\'t Receive Emails',
          'Can\'t Send Emails',
          'Login or Password Issues',
          'Forgot Password',
          'Spam or Junk Mail Problems',
          'Email Settings Help',
          'Blocked/Suspended Account',
          'Email Not Syncing',
          'Change Email Address',
          'Contact Email Support'
        ],
        time: getCurrentTime(),
        isVisible: true
      };
      
      setMessages(prev => [...prev, botResponse, optionsMessage]);
      
      // Reset form data
      setContactFormData({
        name: '',
        email: '',
        problem: ''
      });
      
      // In a real implementation, you would send this data to a backend service
      console.log("Email would be sent to doublemail06@gmail.com with:", contactFormData);
    }, 1000);
  }
  
  function handleOptionClick(option) {
    // Hide all visible option messages
    setMessages(prev => prev.map(msg => 
      msg.options && msg.isVisible ? { ...msg, isVisible: false } : msg
    ));
    
    // Add user's selection as a message
    const userSelectionMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: option,
      time: getCurrentTime()
    };
    
    setMessages(prev => [...prev, userSelectionMessage]);
    
    // Handle Back to Menu option
    if (option === 'Back to Menu') {
      setTimeout(() => {
        const botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "Hi there! I'm the Bytesphere Virtual Assistant. How can I help you today? 😊",
          time: getCurrentTime()
        };
        
        const optionsMessage = {
          id: `options-${Date.now()}`,
          sender: 'bot',
          options: [
            'Can\'t Receive Emails',
            'Can\'t Send Emails',
            'Login or Password Issues',
            'Forgot Password',
            'Spam or Junk Mail Problems',
            'Email Settings Help',
            'Blocked/Suspended Account',
            'Email Not Syncing',
            'Change Email Address',
            'Contact Email Support'
          ],
          time: getCurrentTime(),
          isVisible: true
        };
        
        setMessages(prev => [...prev, botResponse, optionsMessage]);
      }, 500);
      return;
    }
    
    // Handle Contact Email Support option
    if (option === 'Contact Email Support') {
      setTimeout(() => {
        const botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "Please fill out the form below to contact our email support team directly. We'll respond to your inquiry as soon as possible.",
          time: getCurrentTime(),
          isContactForm: true,
          isVisible: true
        };
        
        setMessages(prev => [...prev, botResponse]);
      }, 500);
      return;
    }
    
    // Handle form submission
    if (option === 'Send to Support') {
      handleContactSubmit();
      return;
    }
    
    // Find the previous user message to determine context
    const prevUserMessages = messages.filter(msg => msg.sender === 'user');
    let prevMainOption = null;
    
    if (prevUserMessages.length > 0) {
      const mainOptions = [
        'Can\'t Receive Emails',
        'Can\'t Send Emails',
        'Login or Password Issues',
        'Forgot Password',
        'Spam or Junk Mail Problems',
        'Email Settings Help',
        'Blocked/Suspended Account',
        'Email Not Syncing',
        'Change Email Address'
      ];
      
      // Look for the most recent main option selection
      for (let i = prevUserMessages.length - 1; i >= 0; i--) {
        if (mainOptions.includes(prevUserMessages[i].text)) {
          prevMainOption = prevUserMessages[i].text;
          break;
        }
      }
    }
    
    // Handle all other options
    setTimeout(() => {
      let botResponse;
      let optionsMessage;
      
      switch(option) {
        // Main options from the summary table
        case 'Can\'t Receive Emails':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Let's help you with not receiving emails! Which email service are you using?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Gmail', 'Outlook', 'Yahoo', 'Zoho', 'iCloud', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Can\'t Send Emails':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I understand you're having trouble sending emails. Which provider are you using?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Gmail', 'Outlook', 'Yahoo', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Login or Password Issues':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Sorry to hear you're having login issues. What specific problem are you experiencing?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Forgot password', 'Locked', '2FA', 'Forgot address', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Forgot Password':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I can help you reset your password. Which email service do you use?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Gmail', 'Outlook', 'Yahoo', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Spam or Junk Mail Problems':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Let's sort out those spam or junk mail issues. What specific problem are you having?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Important to spam', 'Too much spam', 'Find folder', 'Newsletters', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Email Settings Help':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I'd be happy to help with your email settings. What would you like to do?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Add to device', 'Change name/signature', 'Forwarding/filters', 'Change password', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Blocked/Suspended Account':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I understand your account has been blocked or suspended. What's your situation?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Temp suspended', 'Permanent', 'Don\'t know why', 'Appeal', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Email Not Syncing':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Let's resolve your email syncing issues. What device type are you using?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Mobile', 'Desktop', 'Tablet', 'Multiple Devices', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Change Email Address':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I can help you change your email address. What would you like to do?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Change login', 'Add recovery', 'Update profile', 'Other', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;

        // Email provider options
        case 'Gmail':
        case 'Outlook':
        case 'Yahoo': 
        case 'Zoho':
        case 'iCloud':
        case 'Other':
          if (prevMainOption === 'Can\'t Receive Emails') {
            botResponse = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `Thanks for letting me know you're using ${option}. What type of issue are you experiencing?`,
              time: getCurrentTime()
            };
            optionsMessage = {
              id: `options-${Date.now()}`,
              sender: 'bot',
              options: ['All emails', 'Specific sender', 'Spam', 'Delayed', 'Other', 'Back to Menu'],
              time: getCurrentTime(),
              isVisible: true
            };
          } 
          else if (prevMainOption === 'Can\'t Send Emails') {
            botResponse = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `Thanks for letting me know you're using ${option}. What issue are you experiencing when sending emails?`,
              time: getCurrentTime()
            };
            optionsMessage = {
              id: `options-${Date.now()}`,
              sender: 'bot',
              options: ['Error', 'Outbox', 'Not received', 'Some only', 'Other', 'Back to Menu'],
              time: getCurrentTime(),
              isVisible: true
            };
          } 
          else if (prevMainOption === 'Forgot Password') {
            botResponse = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `I can help you reset your ${option} password. What specific issue are you experiencing?`,
              time: getCurrentTime()
            };
            optionsMessage = {
              id: `options-${Date.now()}`,
              sender: 'bot',
              options: ['Reset link issue', 'Didn\'t get email', 'Guide', 'Other', 'Back to Menu'],
              time: getCurrentTime(),
              isVisible: true
            };
          } 
          else {
            botResponse = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `I understand you're using ${option}. What specific issue are you experiencing?`,
              time: getCurrentTime()
            };
            optionsMessage = {
              id: `options-${Date.now()}`,
              sender: 'bot',
              options: ['Need troubleshooting steps', 'Contact support team', 'Back to Menu'],
              time: getCurrentTime(),
              isVisible: true
            };
          }
          break;
          
        // Issue specific options (third level)
        case 'All emails':
        case 'Specific sender':
        case 'Spam':
        case 'Delayed':
        case 'Error':
        case 'Outbox':
        case 'Not received':
        case 'Some only':
        case 'Reset link issue':
        case 'Didn\'t get email':
        case 'Guide':
        case 'Important to spam':
        case 'Too much spam':
        case 'Find folder':
        case 'Newsletters':
        case 'Add to device':
        case 'Change name/signature':
        case 'Forwarding/filters':
        case 'Change password':
        case 'Temp suspended':
        case 'Permanent':
        case 'Don\'t know why':
        case 'Appeal':
        case 'Mobile':
        case 'Desktop':
        case 'Tablet':
        case 'Multiple Devices':
        case 'Change login':
        case 'Add recovery':
        case 'Update profile':
        case 'New not appearing':
        case 'Sent not syncing':
        case 'Folders missing':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `I understand you're having an issue with "${option}". Here are some troubleshooting steps:
            
1. Check your internet connection
2. Restart your email app or refresh your browser
3. Check account settings
4. Make sure you have enough storage
5. Check for any service outages
            
Would you like more specific help with this issue?`,
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Need more help', 'Contact support team', 'Issue resolved', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        // Final help options
        case 'Need more help':
        case 'Need troubleshooting steps':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `Here are more detailed steps to troubleshoot your issue:

1. Check if your email filters are correctly set up
2. Make sure your email account storage isn't full
3. Try accessing your email from a different device
4. Check if there are any service outages for your email provider
5. Try using a different network connection
6. Clear cache and cookies if using webmail

Did any of these steps help resolve your issue?`,
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Issue resolved', 'Contact support team', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        case 'Contact support team':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I'll connect you with our specialized support team. Please fill out the form below to contact our email support team directly.",
            time: getCurrentTime(),
            isContactForm: true,
            isVisible: true
          };
          break;
          
        case 'Issue resolved':
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Great! I'm glad we could help resolve your issue. Is there anything else I can assist you with today?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: [
              'Can\'t Receive Emails',
              'Can\'t Send Emails',
              'Login or Password Issues',
              'Forgot Password',
              'Spam or Junk Mail Problems',
              'Email Settings Help',
              'Blocked/Suspended Account',
              'Email Not Syncing',
              'Change Email Address',
              'Contact Email Support'
            ],
            time: getCurrentTime(),
            isVisible: true
          };
          break;
          
        // Fallback for other options
        default:
          botResponse = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I'll need more information to help with that. Could you provide more details about your issue?",
            time: getCurrentTime()
          };
          optionsMessage = {
            id: `options-${Date.now()}`,
            sender: 'bot',
            options: ['Contact support team', 'Back to Menu'],
            time: getCurrentTime(),
            isVisible: true
          };
      }
      
      // Add bot's response
      setMessages(prev => [...prev, botResponse]);
      
      // Add options message if available
      if (optionsMessage) {
        setTimeout(() => {
          setMessages(prev => [...prev, optionsMessage]);
        }, 300);
      }
    }, 800);
  }
  
  return (
    <div className="font-sans">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 hover:scale-105 transition-transform duration-300 text-white rounded-full p-5 shadow-2xl z-50 animate-bounce-slow"
        aria-label="Open chat support"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 sm:w-96 rounded-3xl shadow-2xl z-50 flex flex-col h-[540px] border border-gray-200 overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/90 backdrop-blur-xl" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-t-3xl p-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center shadow-md">
                <span className="text-white text-2xl drop-shadow">💻</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg tracking-tight">Bytesphere Support</h3>
                <p className="text-xs text-gray-500">{currentTime}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-white/60 via-white/80 to-white/60 backdrop-blur-lg" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex flex-col space-y-5">
              {messages.map((message, index) => (
                <div key={message.id || index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'bot' && message.isInitial && (
                    <div className="max-w-[85%] bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md border border-gray-100">
                      <p className="text-gray-800 text-base font-medium">{message.text}</p>
                      <span className="text-gray-400 text-xs mt-1">{message.time}</span>
                    </div>
                  )}
                  {message.sender === 'bot' && message.text && !message.isInitial && !message.isContactForm && (
                    <div className="max-w-[85%] bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md border border-gray-100">
                      <p className="text-gray-800 text-base whitespace-pre-line">{message.text}</p>
                      <span className="text-gray-400 text-xs mt-1">{message.time}</span>
                    </div>
                  )}
                  {message.sender === 'bot' && message.isContactForm && message.isVisible && (
                    <div className="max-w-[80%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100">
                      <p className="text-gray-800 text-base whitespace-pre-line font-medium">{message.text}</p>
                      <span className="text-gray-400 text-xs mt-1">{message.time}</span>
                      
                      {/* Contact form */}
                      <div className="mt-4 bg-white/70 p-4 rounded-xl border border-gray-200 shadow-inner">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wide">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={contactFormData.name}
                              onChange={(e) => handleContactInput('name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/60 text-sm bg-white/80 placeholder-gray-400"
                              placeholder="John Doe"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wide">
                              Your Email
                            </label>
                            <input
                              type="email"
                              value={contactFormData.email}
                              onChange={(e) => handleContactInput('email', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/60 text-sm bg-white/80 placeholder-gray-400"
                              placeholder="your.email@example.com"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wide">
                              Describe Your Problem
                            </label>
                            <textarea
                              value={contactFormData.problem}
                              onChange={(e) => handleContactInput('problem', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/60 text-sm bg-white/80 placeholder-gray-400"
                              placeholder="Please describe your email issue in detail..."
                            />
                          </div>
                          
                          <div>
                            <button
                              onClick={() => handleOptionClick('Send to Support')}
                              className="w-full bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 hover:from-orange-500 hover:to-purple-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-200 text-sm tracking-wide"
                            >
                              Send to Support
                            </button>
                          </div>
                          
                          <div className="text-center">
                            <button
                              onClick={() => handleOptionClick('Back to Menu')}
                              className="text-xs text-gray-500 hover:text-orange-500 transition-colors font-medium"
                            >
                              Cancel and go back to menu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message.sender === 'bot' && message.options && message.isVisible && (
                    <div className="w-full">
                      <div className="text-xs text-gray-400 mb-1 ml-1">{message.time}</div>
                      <div className="flex flex-wrap gap-3">
                        {message.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleOptionClick(option)}
                            className="bg-gradient-to-tr from-white/90 to-white/60 hover:from-orange-50 hover:to-pink-50 text-indigo-800 text-sm py-2 px-5 rounded-full border border-gray-200 shadow-sm transition-all font-semibold hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300/40"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.sender === 'user' && (
                    <div className="max-w-[80%] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-4 rounded-2xl text-white shadow-lg border border-blue-200/30">
                      <p className="text-base font-medium">{message.text}</p>
                      <span className="text-blue-100 text-xs mt-1">{message.time}</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}