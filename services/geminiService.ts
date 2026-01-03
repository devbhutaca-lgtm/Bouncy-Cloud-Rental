
import { GoogleGenAI } from "@google/genai";
import { Booking } from "../types";

export const generateConfirmationEmail = async (booking: Booking): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Generate a warm, professional, and exciting booking confirmation email for a bouncy castle rental.
    
    Customer Name: ${booking.firstName} ${booking.lastName}
    Rental Period: ${booking.startDate} to ${booking.endDate}
    Total Price: $${booking.totalPrice} (plus $${booking.deposit} refundable deposit)
    Address: ${booking.address}
    Customer Comments: ${booking.comments || "None"}
    
    The email should include:
    1. A joyful subject line.
    2. Confirmation of the multi-day rental period.
    3. CLEAR REMINDER: Setup and logistics are managed by the customer. 
    4. CLEAR REMINDER: Customers are responsible for keeping the unit clean.
    5. A brief "Logistics" section (unit is delivered/picked up, customer handles placement).
    6. A warm closing.
    
    Keep it cheerful but professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Booking confirmed! We look forward to seeing you.";
  } catch (error) {
    console.error("Error generating email with Gemini:", error);
    return `Hi ${booking.firstName}, your booking from ${booking.startDate} to ${booking.endDate} is confirmed! Total: $${booking.totalPrice}. Reminder: Setup and cleaning are managed by you.`;
  }
};
