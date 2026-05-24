import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getWaterSavingDiagnosis(userInput: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个专业的节水诊断专家，你的名字叫“水麒麟”。你现在正在一个聊天窗口中与用户进行实时对话。
      你的目标是通过对话，引导用户提供信息，最后给出一份专业的节水诊断建议。
      
      当前对话背景:
      ${context}
      
      用户最新输入:
      ${userInput}
      
      规则：
      1. 如果用户信息不足（比如只说了行业），请礼貌地追问其具体的用水规模、目前遇到的问题点（如漏损、费水、水质要求等）。
      2. 如果已经有足够信息，请给出结构化的建议：
         - 现状初步评估
         - 改进建议（含具体技术方向）
         - 推荐的设备类型
         - 预估成效
      3. 语气要像“蚂蚁阿福”一样专业、诚恳、乐于助人且简洁。
      4. 每次回复不要太长，保持对话感。`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    return "抱歉，由于网络波动，AI诊断暂时无法使用。请在稍后重试。";
  }
}
