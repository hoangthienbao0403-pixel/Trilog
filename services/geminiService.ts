import { GoogleGenAI } from "@google/genai";
import { JournalData, CategoryType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeJournalEntries = async (
  startDate: string,
  endDate: string,
  data: JournalData,
  language: 'en' | 'zh'
): Promise<string> => {
  
  // Filter entries
  const entriesInRange = Object.entries(data).filter(([date]) => {
    return date >= startDate && date <= endDate;
  }).sort((a, b) => a[0].localeCompare(b[0]));

  if (entriesInRange.length === 0) {
    return language === 'zh' ? "这段时间没有找到可以分析的记录。" : "No entries found for this period to analyze.";
  }

  // Construct prompt content
  let promptText = "";
  
  if (language === 'zh') {
    promptText = `我有一个日记应用，每天记录三件事：一点小胜利（Victory）、一点小焦虑（Anxiety）和一点小感恩（Gratitude）。
    请分析我从 ${startDate} 到 ${endDate} 的记录，并总结我这段时间的情绪旅程和心境变化。
    
    输出格式要求：简洁、富有同理心的心理学洞察。关注模式、情绪转变和心理韧性。
    不要只是罗列事件；请将它们综合成关于我幸福感的故事。请用中文回答。
    
    以下是记录内容：
    `;
  } else {
    promptText = `I have a journal where I record three things daily: a little victory, a little anxiety, and a little gratitude. 
    Please analyze my entries from ${startDate} to ${endDate} and provide a summary of my emotional journey and mindset changes.
    
    Format the output as a concise, empathetic psychological insight. Focus on patterns, emotional shifts, and resilience. 
    Do not just list the events; synthesize them into a narrative about my well-being.
    
    Here are the entries:
    `;
  }

  entriesInRange.forEach(([date, entry]) => {
    promptText += `\nDate: ${date}\n`;
    if (entry.victory.text) promptText += `- Victory: ${entry.victory.text}\n`;
    if (entry.anxiety.text) promptText += `- Anxiety: ${entry.anxiety.text}\n`;
    if (entry.gratitude.text) promptText += `- Gratitude: ${entry.gratitude.text}\n`;
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        systemInstruction: language === 'zh' 
          ? "你是一位富有同理心、洞察力且专业的个人成长 AI 助手。你的语气温暖、极简且深刻，类似于高端正念 App 的风格。"
          : "You are an empathetic, insightful, and professional personal growth AI assistant. Your tone is warm, minimalist, and profound, similar to a high-end mindfulness app.",
      }
    });

    return response.text || (language === 'zh' ? "暂时无法生成分析。" : "Could not generate analysis at this time.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'zh' 
      ? "连接 AI 服务时出错，请稍后再试。" 
      : "An error occurred while connecting to the AI service. Please try again later.";
  }
};