import { auth } from 'firebase';

export const authService = {
    login,
    logout
}


function login(email,password){
    return auth().signInWithEmailAndPassword(email,password);
}

function logout(){
    return auth().signOut();
}

