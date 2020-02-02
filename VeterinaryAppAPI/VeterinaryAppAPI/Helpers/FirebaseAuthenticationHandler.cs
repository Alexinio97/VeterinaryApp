using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using VeterinaryAppAPI.Models;
using VeterinaryAppAPI.Services;

namespace VeterinaryAppAPI.Helpers
{
    public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly IUserService _userService;
        public FirebaseAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock,
            IUserService userService)
            : base(options, logger, encoder, clock)
        {
            _userService = userService;
        }
        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {

            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return AuthenticateResult.Fail("Missing authorization header.");
            }

            LoginModel user = new LoginModel();

            try
            {
                var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
                var credentialBytes = Convert.FromBase64String(authHeader.Parameter);
                var credentials = Encoding.UTF8.GetString(credentialBytes).Split(new[] { ':' }, 2);
                System.Diagnostics.Debug.WriteLine(credentials[0] + ":" + credentials[1]);
                
                var email = credentials[0];
                var password = credentials[1];
                user.Id = 1;
                user = await _userService.Authenticate(email, password);
            }
            catch
            {
                return AuthenticateResult.Fail("Invalid Authorization Header");
            }

            if(user == null)
            {
                return AuthenticateResult.Fail("Invalid email or password");
            }

            AuthenticationTicket ticket=null;
            var claims = new[]
            {
                
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString(),
                    ClaimTypes.Email,user.Email)
            };
            try
            {
                var identity = new ClaimsIdentity(claims, Scheme.Name);
                var principal = new ClaimsPrincipal(identity);
                ticket = new AuthenticationTicket(principal, Scheme.Name);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Problem at Claims: " + ex.ToString());
                return AuthenticateResult.Fail("Failed to create claims.");
            }
            

            return AuthenticateResult.Success(ticket);
        }
    }
}
