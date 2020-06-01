import { db } from '../firebaseConfig/config';
import { fromUnixTime } from 'date-fns';

const medicId = localStorage.getItem("medicId");

export const animalService = {
    getUsersAnimals,
    UpdateAnimal,
    DeleteAnimal,
    AddAnimal,
    getAnimalAppointments,
    // treatments
    getTreatments,
    addTreatment,
    deleteTreatment,
    updateTreatment,
}


async function getUsersAnimals(clientId) {
    var animals = []
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var newAnimal = doc.data();
            newAnimal["Id"] = doc.id;
            animals.push(newAnimal);
        });
        console.log(animals);
        return animals;
    }).catch( err => console.log("Error caught: " + err));
}

async function UpdateAnimal(animal,clientId) {
    var animalId = animal.Id;
    delete animal['Id'];
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").doc(animalId).set(animal).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function AddAnimal(animal,clientId) {
    delete animal['Id'];
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").add(animal).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function DeleteAnimal(animalId,clientId)
{
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").doc(animalId).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
}


// method that returns animal appointments that have been executed already
async function getAnimalAppointments(clientId,animalName){
    let appointments = [];
    let appointmentsRef = db.collection('Medics').doc(medicId).collection("Appointments");
    
    return appointmentsRef.where("animalName","==",animalName).where("clientId","==",clientId)
    .get().then( querySnapshot => {
        querySnapshot.forEach( appointment =>{
            let oldAppointment = appointment.data();
            let convertedAppointment = new Date(fromUnixTime(oldAppointment.endTime.seconds));
            if(convertedAppointment < new Date())
            {
                oldAppointment["Id"] = appointment.id;
                appointments.push(oldAppointment);
            }
        });
        return appointments;
    }).catch( err => console.error("Error caught!",err));
}

// treatment functions
async function getTreatments(clientId,animalName){
    var treatments = []
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Treatments")
    .where("animalName","==",animalName).get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var newTreatment = doc.data();
            newTreatment["Id"] = doc.id;
            treatments.push(newTreatment);
        });
        return treatments;
    }).catch( err => console.log("Error caught: " + err));
}

async function addTreatment(newTreatment,clientId){
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).
    collection("Treatments").add(newTreatment).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

async function deleteTreatment(oldTreatment,clientId){
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId)
    .collection("Treatments").doc(oldTreatment.Id).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

async function updateTreatment(newTreatment,clientId) {
    let treatmentId = newTreatment.Id;
    delete newTreatment['Id'];
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId)
    .collection("Treatments").doc(treatmentId).update(newTreatment).then(function() {
        console.log("Document successfully updated!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

// function logout() {
//     localStorage.removeItem('user');
// }

// function handleResponse(response){
//     console.log("Handling response");
//     console.log(response);
//     return response.text().then(text => {
//         const data = text && JSON.parse(text);
//         console.log(data);
//         if(!response.ok) {
//             if(response.status === 401){
//                 //auto logout if unauthorized is received from api
//                 logout();
//                 window.location.reload(true);
//             }
//             const error = (data && data.message) || response.statusText;
//             console.log("Text is: " + response.statusText);
//             return Promise.reject(error);
//         }
        
//         return data;
//     });
// }