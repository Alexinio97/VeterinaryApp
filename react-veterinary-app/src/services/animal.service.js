import { db } from '../firebaseConfig/config';
import { auth } from 'firebase';

const medicId = localStorage.getItem("medicId");

export const animalService = {
    getUsersAnimals,
    UpdateAnimal,
    DeleteAnimal,
    AddAnimal
}


async function getUsersAnimals(clientId) {
    var animals = []
    console.log("Client id is: "+ auth().currentUser.uid);
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
    console.log(animal);
    delete animal['Id'];
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").add(animal).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function DeleteAnimal(animalId,clientId)
{
    console.log(animalId);
    return db.collection('Medics').doc(medicId).collection("Clients").doc(clientId).collection("Animals").doc(animalId).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
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