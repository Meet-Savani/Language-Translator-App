import React, { useEffect, useState } from 'react'
import countries from '../data.js'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { IoMdSwap } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";
import { FaCopy } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { button } from 'framer-motion/client';

const Translate = () => {
    const [fromLanguage, setFromLanguage] = useState("en-GB");
    const [toLanguage, setToLanguage] = useState("hi-IN");
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");
    const [rotated, setRotated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const handleSwap = () => {
        setRotated(prev => !prev); 

        setFromLanguage(toLanguage);
        setToLanguage(fromLanguage);
        localStorage.setItem("fromLang", toLanguage);
        localStorage.setItem("toLang", fromLanguage);

        setFromText(toText);
        setToText(fromText);
    }

    useEffect(() => {
        const savedFromLang = localStorage.getItem('fromLang');
        const savedToLang = localStorage.getItem('toLang');
        if (savedFromLang) setFromLanguage(savedFromLang);
        if (savedToLang) setToLanguage(savedToLang);
    }, []);

    const handleTranslate = async () => {
        if (!fromText.trim()) {
            alert("Please enter text to translate.");
            return;
        } 

        setLoading(true);
        document.getElementById("from-language").disabled = true;
        document.getElementById("to-language").disabled = true;
        document.getElementById("from-text-area").disabled = true;
    
        try {
            const source = fromLanguage.split("-")[0];
            const target = toLanguage.split("-")[0];
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(fromText)}&langpair=${source}|${target}`);
            if(!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.responseData.translatedText || `HTTP Error? status: ${res.status}`);
            }
            const data = await res.json();
            if(data.responseStatus !== 200) {
                throw new Error(data.responseDetails || "Translation service error.");
            }
            setToText(data.responseData.translatedText);
        } catch (error) {
            console.error(error);
            setToText(`Error: ${error.message} || "An unexpected error occurred while translating."`);
        } finally {
            setLoading(false); 
            document.getElementById("from-language").disabled = false;
            document.getElementById("to-language").disabled = false;
            document.getElementById("from-text-area").disabled = false;
        }
    };

    const handleCopy = () => {
        if(toText) {
            navigator.clipboard.writeText(toText).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000); 
            }).catch(err => {
                setCopySuccess('Failed to copy!');
                console.error('Failed to copy text: ', err);
            })
        }
    }

    return (
        <div className='mx-auto w-[80%] md:w-[60%] border-2 border-green-600 px-4 py-2  rounded-xl my-2'>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='text-xl sm:text-2xl md:text-3xl text-center px-4 py-2'>Language Translator</h1>
                <div className='border-2 border-green-500 w-[80%] rounded-lg'></div>
            </div>
            <p className='mt-2 md:mt-4 text-center text-xs sm:text-sm md:text-base text-gray-600'>Translate text between multiple languages instantly</p>
            <div className='flex flex-col w-full items-center justify-center px-4 py-2'>
                <div className='flex flex-col sm:flex-row mt-4 items-center justify-between gap-3 sm:gap-6 w-full'>
                    <div className='bg-green-400 px-4 py-2 rounded-xl sm:w-[60%]'>
                        <h2 className='sm:text-lg font-semibold mb-1'>Source Language</h2>
                        <select 
                        id="from-language" 
                        className='px-4 py-1 rounded-lg w-full outline-none' 
                        value={fromLanguage} 
                        onChange={(e) => {
                            setFromLanguage(e.target.value);
                            localStorage.setItem("fromLang", e.target.value);
                        }}
                        disabled={loading}>
                            {Object.entries(countries).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Icon  */}
                    <motion.div 
                    animate={{ rotate: rotated ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, duration:0.4 }}
                    onClick={handleSwap}
                    className="swap-icon flex items-center justify-center w-12 h-8 md:w-16 md:h-12 rounded-full bg-green-400 shadow-md cursor-pointer">
                        <IoMdSwap className='text-2xl md:text-3xl cursor-pointer text-white' />
                    </motion.div>

                    <div className='bg-green-400 px-4 py-2 rounded-xl sm:w-[60%]'>
                        <h2 className='sm:text-lg font-semibold mb-1'>Target Language</h2>
                        <select 
                        id="to-language" 
                        value={toLanguage}
                        onChange={(e) => {
                            setToLanguage(e.target.value)
                            localStorage.setItem("toLang", e.target.value)
                        }}
                        disabled={loading}
                        className='px-4 py-1 rounded-lg w-full outline-none'>
                            {Object.entries(countries).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='flex justify-center w-full'>
                    <textarea id="from-text-area" 
                    rows={4} cols={90} 
                    className='border border-green-500 outline-none mt-4 px-2 py-1 select-area rounded-md resize-none overflow-x-hidden overflow-y-auto custom-scroll-green'
                    value={fromText}
                    onChange={(e) => setFromText(e.target.value)}
                    placeholder='Enter text to translate...'></textarea>
                </div>

                <div className='flex justify-center mt-2'>
                    <button className='px-3 py-1.5 sm:px-6 sm:py-2 sm:text-xl bg-green-500 rounded-full text-center text-white font-semibold' 
                    id='translate-btn'
                    onClick={handleTranslate}
                    disabled={loading}>
                        { loading ? <AiOutlineLoading className="animate-spin text-2xl" /> : "Translate" }
                    </button>
                </div>

                {/* Output */}
                <div className='flex justify-center relative mt-2 w-full'>
                    <textarea id="to-text-area" 
                    rows={4} cols={90} 
                    className='border-l-4 border border-green-600 px-4 py-3 w-full select-area rounded-md bg-green-100 outline-none resize-none relative overflow-x-hidden overflow-y-auto custom-scroll-green'
                    value={toText}
                    readOnly></textarea>
                    {toText && (
                        <button onClick={handleCopy}
                        className='absolute top-2 right-1 bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors duration-200'
                        title='Copy to clipboard'>
                            <FaCopy className='text-base text-gray-500 hover:text-green-500 cursor-pointer' />
                        </button>
                    )}
                    {copySuccess && (
                        <span className="absolute top-12 right-1 text-sm text-green-700 bg-white px-2 py-1 rounded shadow-sm animate-fade-in-out">
                            {copySuccess}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Translate
