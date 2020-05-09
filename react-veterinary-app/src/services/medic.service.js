
import { db, storage } from '../firebaseConfig/config';
import { auth } from 'firebase';
import { addDays, set} from 'date-fns';

export const medicService = {
    login,
    // logout,
    getAllClients,
    getMedicData,
    // appointments
    getAppointments,
    GetAppointmentsFuture,
    addAppointment,
    updateAppointment,
    deleteAppointment,

    UpdateMedic,
    uploadMedicPhoto,
    // settings for appointment types
    getAppointmentTypes,
    addAppType,
    updateAppType,
    deleteAppType,
    // settings for inventory cattegories
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
}

async function login(email,password){
    return auth().signInWithEmailAndPassword(email,password).then( () =>{
        var user = auth().currentUser;
        return user;
    } );
}

async function getAllClients() {
    var medicId = localStorage.getItem("medicId")
    var clients = []
    return db.collection('Medics').doc(medicId).collection("Clients").get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var newClient = doc.data();
            newClient["Id"] = doc.id;
            clients.push(newClient);
        });
        return clients;
    }).catch( err => console.log(err));
}

async function getMedicData()
{
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).get().then( querySnapshot => {
        var medic = querySnapshot.data();
        return medic;
    }).catch( err => console.log(err));
}

async function getAppointments(day)
{
    day = set(day,{hours:0,minutes:0,seconds:0});

    let endDate = addDays(day,1);
    let appointments = [];
    let medicId = auth().currentUser.uid;
    let appointmentsRef = db.collection('Medics').doc(medicId).collection("Appointments");
    return appointmentsRef.where("startTime",">=",day).where("startTime","<",endDate)
    .get().then( querySnapshot => {
        querySnapshot.forEach( appointment =>{
            let newAppointment = appointment.data();
            newAppointment["Id"] = appointment.id;
            appointments.push(newAppointment);
        });
        return appointments;
    }).catch( err => console.log(err));
}

async function GetAppointmentsFuture()
{
    let currentDay = new Date();
    currentDay.setHours(0,0,0);
    let medicId = auth().currentUser.uid;
    let appointments = [];
    let appointmentsRef = db.collection('Medics').doc(medicId).collection("Appointments");
    return appointmentsRef.where("startTime",">=",currentDay)
    .get().then( querySnapshot => {
        querySnapshot.forEach( appointment =>{
            let newAppointment = appointment.data();
            newAppointment["Id"] = appointment.id;
            appointments.push(newAppointment);
        });
        return appointments;
    }).catch( err => console.log(err));
}

async function addAppointment(appointment){
    //delete appointment['Id'];
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Appointments").add(appointment).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function deleteAppointment(appointId){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Appointments").doc(appointId).delete().then( function () {
        console.log("Appointment deleted!");
    }).catch(function(error) {
        console.error("Error deleting appointment!",error);
    })
}

// update appointment method in order to update the meds used and the price
async function updateAppointment(appointment){
    let medicId = auth().currentUser.uid;
    let appointmentId = appointment.Id;
    delete appointment['Id'];
    delete appointment['startTime'];
    delete appointment['endTime'];
    return db.collection('Medics').doc(medicId).collection('Appointments').doc(appointmentId).update(appointment).then(function() {
        console.log("Document updated succesfully!");
    }).catch(err => console.error("Error caught",err));
}

async function UpdateMedic(medic) {
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).update(medic).then(function() {
        console.log("Medic updated!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function uploadMedicPhoto(photo,photoName){
    if(photo !== null)
    {
      return storage.ref(`medicsProfilePic/${photoName}`).put(photo);
  
    //   uploadTask.on('state_changed', snapshot => {
    //     let progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
    //     console.log('Upload is ' + progress + '% done');
    //   },function(error) {
    //     console.log("Error uploading file: " + error.message);
    //   },function() {
    //     uploadTask.snapshot.ref.getDownloadURL().then(function(downloadUrl) {
    //         return downloadUrl;
    //     });
    //   });
    }
  }


  // settings methods
async function getAppointmentTypes(){
    let medicId = auth().currentUser.uid;
    let appointmentTypes = [];
    return db.collection('Medics').doc(medicId).collection('AppointmentTypes').get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var newAppType = doc.data();
            newAppType["Id"] = doc.id;
            appointmentTypes.push(newAppType);
        });
        return appointmentTypes;
    }).catch( err => console.log(err));
}

async function addAppType(appTypes){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("AppointmentTypes").add(appTypes).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function updateAppType(appType){
    let medicId = auth().currentUser.uid;
    let appTypeId = appType.Id;
    delete appType['Id'];
    return db.collection('Medics').doc(medicId).collection("AppointmentTypes").doc(appTypeId).update(appType).then(() =>
    {
        console.log("Document updated!");
    }).catch(err => console.error("Error caught: ",err));
}

async function deleteAppType(appType){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("AppointmentTypes").doc(appType.Id).delete().then(() =>
    {
        console.log("Document deleted!");
    }).catch(err => console.error("Error caught: ",err));
}

// settings methods for inventory categories
async function getCategories(){
    let medicId = auth().currentUser.uid;
    let categories = [];
    return db.collection('Medics').doc(medicId).collection('Categories').get().then( querySnapshot => {
        querySnapshot.forEach(function(doc) {
            var category = doc.data();
            category["Id"] = doc.id;
            categories.push(category);
        });
        return categories;
    }).catch( err => console.log(err));
}

async function addCategory(category){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Categories").add(category).then(function() {
        console.log("Document successfully written!");
    }).catch(function(error) {
        console.error("Error updating document: ", error);
    });
}

async function updateCategory(category){
    let medicId = auth().currentUser.uid;
    let categoryId = category.Id;
    delete category['Id'];
    return db.collection('Medics').doc(medicId).collection("Categories").doc(categoryId).update(category).then(() =>
    {
        console.log("Document updated!");
    }).catch(err => console.error("Error caught: ",err));
}

async function deleteCategory(category){
    let medicId = auth().currentUser.uid;
    return db.collection('Medics').doc(medicId).collection("Categories").doc(category.Id).delete().then(() =>
    {
        console.log("Document deleted!");
    }).catch(err => console.error("Error caught: ",err));
}


// function logout(state) {        
//     localStorage.removeItem('user');
//     state.changeState(false);
// }

// function handleResponse(response){
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