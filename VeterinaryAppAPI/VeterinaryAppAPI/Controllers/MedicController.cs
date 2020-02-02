using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VeterinaryAppAPI.Models;
using VeterinaryAppAPI.Services;

namespace VeterinaryAppAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MedicController : ControllerBase
    {
        private MedicDataAccessLayer _medics = new MedicDataAccessLayer();
        private IUserService _userService;
        public MedicController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/Medic
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var medics = await _medics.GetAllMedics();
            return Ok(medics);
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody]LoginModel model)
        {
            try
            {
                var user = await _userService.Authenticate(model.Email, model.Password);
                if (user == null)
                    return BadRequest(new { message = "Username or password is incorrect" });

                return Ok(user);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return null;
            }
             
        }

        // GET: api/Medic/5
        [HttpGet("{id}", Name = "Get")]
        public Task<Medic> Get(string id)
        {
            return _medics.GetMedicData(id);
        }

        // POST: api/Medic
        [HttpPost]
        public void Post([FromBody] Medic medic)
        {
            _medics.AddMedic(medic);
        }

        // PUT: api/Medic/5
        [HttpPut("{id}")]
        public void Put([FromBody]Medic medic)
        {
            _medics.UpdateMedic(medic);
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(string id)
        {
            _medics.DeleteMedic(id);
        }
    }
}
