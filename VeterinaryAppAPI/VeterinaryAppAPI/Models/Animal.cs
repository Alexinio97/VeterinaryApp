using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VeterinaryAppAPI
{
    public enum Neutered
    {
        Yes,
        No
    }
    public enum Species
    {
        Dog,
        Cat,
        Bird
    }
    [FirestoreData]
    public class Animal
    {
        [FirestoreDocumentId]
        public int Id { get; set; }
        [FirestoreProperty]
        public string Breed { get; set; }
        [FirestoreProperty]
        public string Name { get; set; }
        [FirestoreProperty]
        public int Age { get; set; }
        [FirestoreProperty]
        public Neutered Neutered { get; set; }
        [FirestoreProperty]
        public Species Species { get; set; }
    }
}
