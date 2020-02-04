using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;


namespace VeterinaryAppAPI
{
    [FirestoreData]
    public class Medic
    {
        [FirestoreDocumentId]
        public string Id { get; set; }
        [FirestoreProperty]
        public string FirstName { get; set; }
        [FirestoreProperty]
        public string LastName { get; set; }
        [FirestoreProperty]
        [Required,EmailAddress(ErrorMessage = "Not correct email format")]
        public string Email { get; set; }
        [FirestoreProperty]
        [Required,MinLength(6,ErrorMessage ="Password must be at least 6 characters"),
            MaxLength(30,ErrorMessage ="Password must not be longer than 30 characters")]
        public string Password { get; set; }
        [FirestoreProperty]
        public Schedule Schedule { get; set; }
        [FirestoreProperty]
        public ICollection<Client> Clients { get; set; }
    }
}
