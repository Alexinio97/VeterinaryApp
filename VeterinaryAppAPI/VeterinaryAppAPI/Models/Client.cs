using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace VeterinaryAppAPI
{
    [FirestoreData]
    public class Client
    {
        [FirestoreDocumentId]
        public int Id { get; set; }
        [Required]
        [FirestoreProperty]
        public string FirstName { get; set; }
        [Required]
        [FirestoreProperty]
        public string LastName { get; set; }
        [Required(ErrorMessage = "Email is required!"), DataType(DataType.EmailAddress)]
        [FirestoreProperty]
        public string Email { get; set; }
        [FirestoreProperty]
        public string Password { get; set; }
        [Required,StringLength(13,ErrorMessage ="Id code must be 13 characters",MinimumLength =13)]
        [FirestoreProperty]
        public string CNP { get; set; }
        [FirestoreProperty]
        public ICollection<Animal> Animals { get; set; }
    }
}
