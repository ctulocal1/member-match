import {parse, stringify} from "https://deno.land/std@0.202.0/csv/mod.ts";

// Decoder is used for both files
const decoder = new TextDecoder("utf-8");

// Use CSV parser on list with full names and schools
const participantsFile = Deno.readFileSync(Deno.args[0]);
const participantsFileText = decoder.decode(participantsFile);
let participants = parse(participantsFileText, {
  skipFirstRow: true,
  strip: true,
});

// Use CSV parser on district members list
const membersFile = Deno.readFileSync(Deno.args[1]);
const membersFileText = decoder.decode(membersFile);
let members = parse(membersFileText, {
  skipFirstRow: true,
  strip: true,
});

// console.log(members)
// Use CSV parser on district schools list
const schoolsFile = Deno.readFileSync(Deno.args[2]);
const schoolsFileText = decoder.decode(schoolsFile);
let schools = parse(schoolsFileText, {
  skipFirstRow: true,
  strip: true,
});

// Establish results arrays
let result = findMatches (participants, members, schools);

// console.log("Matches:");
// console.log(result['match'])
// console.log("Number of Matches:",result['match'].length)
// console.log("Misses:");
// console.log(result['miss'].length);

console.log("first,last,school,email")
result['match'].forEach( match => {
  console.log(`${match.firstname},${match.lastname},${match.school},${match.email}`)
})
// console.log(result);
// Does most of the work, here.
function findMatches (participants, members, schools) {
  const matches = [];
  const misses = [];

  participants.forEach( (participant) => {
    // console.log(participant);
    // Match short name of school to school dept ID
    let schoolmatch = schools.find( (school) => {
      const schoolname = school.short_name.toLowerCase() 
      const participantSchool = participant.school.toLowerCase() ;
      return schoolname.includes(participantSchool);
    });
    if (!schoolmatch) {schoolmatch = {deptID: "C-W"}}
    const schoolID = parseInt(schoolmatch.deptID);
    // Break off last name from combined name
    const nameParts = participant.fullname.split(" ");
    const firstName = nameParts[0].toLowerCase();
    let lastName = nameParts[nameParts.length - 1].toLowerCase();
    if ( lastName.includes(".")) {
      lastName = lastName.split(".")[0]
    }
    let memberMatches = members.filter( (member) => {
      // console.log(member);
      const memberSchoolId = parseInt(member.deptID);
      // console.log(memberSchoolId , schoolID)
      const memberLastName = member.lastName.toLowerCase();
      // console.log(memberSchoolId, memberLastName)
      return (memberSchoolId - schoolID === 0) && (memberLastName.includes(lastName))
    })
    // console.log(memberMatches.length);
    let member = {};
    if (memberMatches.length === 0 ) {
      misses.push(participant)
    } else if (memberMatches.length === 1){
      member = memberMatches[0];
        // Create object with the First Name, Last Name, School Name and Email Address of match
          const match = {'firstname': member.firstName, 'lastname': member.lastName, 'school': schoolmatch.short_name, 'email': member.email};
        // Add matched to Array of member objects.
          matches.push(match)
      } else {
      member = memberMatches[0];
        memberMatches = memberMatches.filter( (match) => {
          match.firstName.toLowerCase().includes(firstName)
        })
          const match = {'firstname': member.firstName, 'lastname': member.lastName, 'school': schoolmatch.short_name, 'email': member.email};
        // Add matched to Array of member objects.
          matches.push(match)
    }
})
  return {'match': matches, 'miss': misses}
}
