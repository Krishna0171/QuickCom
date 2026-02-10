
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Order, Product } from "../types";

export class AutomationService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateConfirmationEmail(order: Order): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a friendly, professional, and enthusiastic e-commerce order confirmation email for a customer named ${order.customerName}. 
                  Order ID: ${order.id}. 
                  Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}. 
                  Total: $${order.total.toFixed(2)}. 
                  The brand is "QuickStore". Keep it concise but make the customer feel valued.`,
        config: {
          temperature: 0.7,
        },
      });

      return response.text || "Failed to generate custom email.";
    } catch (error) {
      console.error("AI Email Generation Error:", error);
      return `Thank you for your order, ${order.customerName}! Your order ${order.id} is being processed.`;
    }
  }

  async analyzeSupportQuery(message: string): Promise<string> {
    if (!message || message.length < 10) return "";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `A customer is typing a support message for an e-commerce store called QuickStore. 
                  Based on their message: "${message}", provide a single, ultra-short (max 15 words) helpful suggestion or quick tip. 
                  If they mention shipping, mention 3-5 days. If they mention refund, mention 24h processing. 
                  Be concise and helpful. No preamble.`,
        config: {
          temperature: 0.5,
        },
      });
      return response.text || "";
    } catch (error) {
      return "";
    }
  }

  async generateProductInsights(product: Product): Promise<string[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a creative copywriter for an e-commerce store called "QuickStore". 
                  Analyze this product and provide 3 unique, punchy, and persuasive bullet points on "Why you'll love this".
                  Product Name: ${product.name}
                  Description: ${product.description}
                  Category: ${product.category}
                  Return only the 3 bullet points, each on a new line, starting with a dash.`,
        config: {
          temperature: 0.8,
        },
      });

      const text = response.text || "";
      return text.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace('-', '').trim());
    } catch (error) {
      console.error("AI Insight Generation Error:", error);
      return ["Handpicked for quality", "Perfect addition to your collection", "Designed for modern living"];
    }
  }

  async processChat(message: string, history: { role: 'user' | 'model', text: string }[]) {
    const navigateToPageDeclaration: FunctionDeclaration = {
      name: 'navigateToPage',
      parameters: {
        type: Type.OBJECT,
        description: 'Navigates the user to a specific page within the QuickStore application.',
        properties: {
          page: {
            type: Type.STRING,
            description: 'The target page ID. Valid options: home, cart, profile, my-orders, faq, contact, my-tickets, favorites, admin-dashboard.',
          },
        },
        required: ['page'],
      },
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: `You are the QuickStore Virtual Assistant. Your goal is to help users browse products, manage their accounts, and navigate the store. 
          Be friendly, professional, and helpful. 
          
          FORMATTING RULES:
          - Use **bold** for emphasis or key terms.
          - Use bullet points (- ) for lists.
          - Use clear line breaks between paragraphs.
          - Keep responses structured and easy to read.
          
          You have a tool called 'navigateToPage'. Use it whenever the user expresses a desire to visit a specific section.
          Valid pages: 'home', 'cart', 'profile', 'my-orders', 'faq', 'contact', 'my-tickets', 'favorites', 'admin-dashboard'.
          Categories: Home & Kitchen, Toys, Electronics, Lifestyle, Utility.`,
          tools: [{ functionDeclarations: [navigateToPageDeclaration] }],
          temperature: 0.7,
        },
      });

      return response;
    } catch (error) {
      console.error("Chat AI Error:", error);
      throw error;
    }
  }

  async sendMockNotification(type: 'email' | 'whatsapp', recipient: string, content: string) {
    console.log(`[AUTOMATION] Sending ${type} to ${recipient}:`, content);
    return true;
  }
}

export const automation = new AutomationService();
