import { db } from '../firebaseConfig/config';
import { auth } from 'firebase';

export const inventoryService = {
    // inventory methods
    getInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    // meds methods for appointment collection
    addMedsUsed,
    updateMedUsed,
    deletMedUsed,
    getMedsUsed,
}

// Inventory crud methods
async function getInventoryItems(){
    let medicId = auth().currentUser.uid;
    let inventory = [];
    return db.collection('Medics').doc(medicId).collection('Inventory').get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var item = doc.data();
            item["Id"] = doc.id;
            inventory.push(item);
        });
        return inventory;
    }).catch( err => console.log(err));
}

async function addInventoryItem(item){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Inventory").add(item).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function updateInventoryItem(item){
    let medicId = auth().currentUser.uid;
    let itemId = item.Id;
    delete item['Id'];
    return db.collection('Medics').doc(medicId).collection("Inventory").doc(itemId).update(item).then(() =>
    {
        console.log("Document updated!");
    }).catch(err => console.error("Error caught: ",err));
}

async function deleteInventoryItem(item){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Inventory").doc(item.Id).delete().then(() =>
    {
        console.log("Document deleted!");
    }).catch(err => console.error("Error caught: ",err));
}

// methods for meds collection in the appointments 
async function addMedsUsed(medUsed,appointmentId){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection('Appointments').doc(appointmentId).collection('MedsUsed').add(medUsed)
    .then(() => {
        console.log("Meds added succsesfully!");
    }).catch(err => console.error("Error caught: ", err));
}

async function updateMedUsed(medUsed,appointmentId){
    let medicId = auth().currentUser.uid;
    let medId = medUsed.Id;
    delete medId['Id'];
    return db.collection('Medics').doc(medicId).collection('Appointments').doc(appointmentId).collection('MedsUsed').doc(medId).update(medUsed)
    .then(() => {
        console.log("Meds updated succsesfully!");
    }).catch(err => console.error("Error caught: ", err));
}

async function deletMedUsed(medUsed,appointmentId){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection('Appointments').doc(appointmentId).collection('MedsUsed').doc(medUsed.Id).delete()
    .then(() => {
        console.log("Meds deleted succsesfully!");
    }).catch(err => console.error("Error caught: ", err));
}

async function getMedsUsed(appointmentId){
    let medicId = auth().currentUser.uid;
    let medsArr = [];
    return db.collection('Medics').doc(medicId).collection('Appointments').doc(appointmentId).collection('MedsUsed')
    .get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var medUsed = doc.data();
            medUsed["Id"] = doc.id;
            medsArr.push(medUsed);
        });
        return medsArr;
    }).catch( err => console.log(err));
}