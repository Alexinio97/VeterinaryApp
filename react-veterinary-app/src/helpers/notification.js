import { medicService } from "../services/medic.service";
import { firebaseApiKey } from "../firebaseConfig/config";

export const notifications = {
    sendNotification
};

async function sendNotification(clientId,bodyMessage){
    let token = await medicService.getClientNotificationToken(clientId);
    console.log(token);
    const FIREBASE_API_KEY = firebaseApiKey;
    const message = {
     registration_ids: [token], 
      notification: {
        title: "Daily Vet",
        body: bodyMessage,
        "vibrate": 1,
        "sound": 1,
        "show_in_foreground": true,
        "priority": "high",
        "content_available": true,
      },
      data: {
        title: "Daily Vet",
        body: bodyMessage,
      }
    };
  
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": "key=" + FIREBASE_API_KEY
    });
  
    let response = await fetch("https://fcm.googleapis.com/fcm/send", { method: "POST", headers, body: JSON.stringify(message) })
    response = await response.json();
    console.log(response);
    console.log("Notification sent");
}