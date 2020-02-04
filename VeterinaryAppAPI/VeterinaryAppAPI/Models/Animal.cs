using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VeterinaryAppAPI
{

    [FirestoreData]
    public class Animal
    {
        [FirestoreDocumentId]
        public string Id { get; set; }
        [FirestoreProperty]
        public string Breed { get; set; }
        [FirestoreProperty]
        public string Name { get; set; }
        [FirestoreProperty]
        public int Age { get; set; }
        [FirestoreProperty]
        public string Neutered { get; set; }
        [FirestoreProperty]
        public string Species { get; set; }
    }
}
