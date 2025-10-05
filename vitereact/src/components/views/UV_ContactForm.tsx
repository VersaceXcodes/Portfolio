import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { createContactMessageInputSchema } from '@/DB/zodschemas';

const UV_ContactForm: React.FC = () => {
  // Global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // Form state
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    message_content: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Refs for auto-scroll
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  
  // Toast timeout ref
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear toast message after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage('');
      }, 3000);
    }
    
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [toastMessage]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sender_name.trim()) {
      newErrors.sender_name = 'Name is required';
    }
    
    if (!formData.sender_email.trim()) {
      newErrors.sender_email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.sender_email)) {
        newErrors.sender_email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.message_content.trim()) {
      newErrors.message_content = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Check if we have a recipient user
    if (!currentUser?.user_id) {
      setToastMessage('Unable to send message: recipient not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate with Zod schema
      const validatedData = createContactMessageInputSchema.parse({
        message_id: `msg_${Date.now()}`,
        user_id: currentUser.user_id,
        sender_name: formData.sender_name,
        sender_email: formData.sender_email,
        sender_phone: formData.sender_phone || null,
        message_content: formData.message_content,
        sent_at: new Date().toISOString(),
        status: 'pending'
      });
      
      // Make API request
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/contact-messages`,
        validatedData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` })
          }
        }
      );
      
      if (response.status === 201) {
        setSubmitSuccess(true);
        setToastMessage('Message sent successfully!');
        setFormData({
          sender_name: '',
          sender_email: '',
          sender_phone: '',
          message_content: ''
        });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      setToastMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle field focus for auto-scroll
  const handleFieldFocus = (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Close modal function (would be called by parent in a real implementation)
  const closeModal = () => {
    // In a real app, this would be handled by the modal parent component
    window.history.back();
  };
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeModal}
      ></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Contact Me</h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal body */}
          <div className="p-6">
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Message Sent!</h3>
                <p className="mt-2 text-gray-500">
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <div className="mt-6">
                  <button
                    onClick={closeModal}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field */}
                <div>
                  <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id="sender_name"
                    name="sender_name"
                    type="text"
                    value={formData.sender_name}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus(nameRef)}
                    className={`mt-1 block w-full px-4 py-3 border ${
                      errors.sender_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="John Doe"
                  />
                  {errors.sender_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.sender_name}</p>
                  )}
                </div>
                
                {/* Email field */}
                <div>
                  <label htmlFor="sender_email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="sender_email"
                    name="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus(emailRef)}
                    className={`mt-1 block w-full px-4 py-3 border ${
                      errors.sender_email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="john@example.com"
                  />
                  {errors.sender_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.sender_email}</p>
                  )}
                </div>
                
                {/* Phone field (optional) */}
                <div>
                  <label htmlFor="sender_phone" className="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    ref={phoneRef}
                    id="sender_phone"
                    name="sender_phone"
                    type="tel"
                    value={formData.sender_phone}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus(phoneRef)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                {/* Message field */}
                <div>
                  <label htmlFor="message_content" className="block text-sm font-medium text-gray-700">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={messageRef}
                    id="message_content"
                    name="message_content"
                    rows={4}
                    value={formData.message_content}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus(messageRef)}
                    className={`mt-1 block w-full px-4 py-3 border ${
                      errors.message_content ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Type your message here..."
                  ></textarea>
                  {errors.message_content && (
                    <p className="mt-1 text-sm text-red-600">{errors.message_content}</p>
                  )}
                </div>
                
                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300"
          style={{ 
            backgroundColor: toastMessage.startsWith('Error') ? '#EF4444' : '#10B981',
            animation: toastMessage ? 'fadeIn 0.3s, fadeOut 0.3s 2.7s' : 'none'
          }}
        >
          {toastMessage}
        </div>
      )}
      
      {/* Toast animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
      `}</style>
    </>
  );
};

export default UV_ContactForm;