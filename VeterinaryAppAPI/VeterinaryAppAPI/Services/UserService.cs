using Firebase.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VeterinaryAppAPI.Models;

namespace VeterinaryAppAPI.Services
{
    public interface IUserService
    {
        Task<LoginModel> Authenticate(string email, string password);
    }
    public class UserService : IUserService
    {
        public async Task<LoginModel> Authenticate(string email, string password)
        {
            var authProvider = new FirebaseAuthProvider(new FirebaseConfig("<API_KEY>"));
            try
            {
                var result = await authProvider.SignInWithEmailAndPasswordAsync(email, password);
                LoginModel user = new LoginModel { Email = email ,Id = result.User.LocalId};
                return user;
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return null;
            }
        }
    }
}
