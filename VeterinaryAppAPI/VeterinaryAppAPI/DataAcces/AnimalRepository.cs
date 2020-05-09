using Google.Cloud.Firestore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VeterinaryAppAPI.DataAcces
{
    public class AnimalRepository
    {
        public FirestoreDb _firestoreDb;
        public AnimalRepository(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }

        // method that will retrieve animals per user
        public async Task<List<Animal>> GetUserAnimals(string clientId, string loggedUserId)
        {
            Query AnimalQuery = _firestoreDb.Collection("Medics").Document(loggedUserId).Collection("Clients").Document(clientId).Collection("Animals");
            QuerySnapshot AnimalsQuerySnapshot = await AnimalQuery.GetSnapshotAsync();
            List<Animal> lstAnimals = new List<Animal>();

            foreach (var snapshot in AnimalsQuerySnapshot.Documents)
            {
                if (snapshot.Exists)
                {
                    Dictionary<string, object> animal = snapshot.ToDictionary();
                    string jsonAnimal = JsonConvert.SerializeObject(animal);
                    Animal newAnimal = JsonConvert.DeserializeObject<Animal>(jsonAnimal);
                    newAnimal.Id = snapshot.Id;
                    lstAnimals.Add(newAnimal);
                }
            }
            return lstAnimals;
        }

        public async Task<Animal> GetAnimal(string animalId)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection("Animals").Document(animalId);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();
                if (snapshot.Exists)
                {
                    Animal newAnimal = snapshot.ConvertTo<Animal>();
                    newAnimal.Id = snapshot.Id;
                    return newAnimal;
                }
                else
                {
                    return new Animal();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return null;
            }
        }

        public async void AddAnimal(Animal animal,string loggedUserId,string clientId)
        {
            try
            {
                CollectionReference colRef = _firestoreDb.Collection("Medics").Document(loggedUserId).Collection("Clients")
                    .Document(clientId).Collection("Animals");
                await colRef.AddAsync(animal);
            }
            catch
            {
                throw;
            }
        }

        public async Task DeleteAnimalAsync(string animalId, string loggedUserId,string clientId)
        {
            try
            {
                DocumentReference animalToDelete = _firestoreDb.Collection("Medics").Document(loggedUserId).Collection("Clients")
                    .Document(clientId).Collection("Animals").Document(animalId);
                await animalToDelete.DeleteAsync();
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                throw;
            }
        }

        public async void UpdateAnimal(Animal animal,string loggedUserId,string clientId)
        {
            try
            {
                DocumentReference animalToUpdate = _firestoreDb.Collection("Medics").Document(loggedUserId).Collection("Clients")
                    .Document(clientId).Collection("Animals").Document(animal.Id);
                await animalToUpdate.SetAsync(animal, SetOptions.Overwrite);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                throw;
            }
        }
    }
}
