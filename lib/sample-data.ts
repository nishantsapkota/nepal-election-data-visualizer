import type { Voter } from "./types"

const municipalities = [
  "Banepa Municipality",
  "Dhulikhel Municipality",
  "Panauti Municipality",
  "Panchkhal Municipality",
  "Namobuddha Municipality",
]

const maleFirstNames = [
  "Ram", "Shyam", "Hari", "Krishna", "Bishnu", "Ganesh", "Suresh", "Rajesh",
  "Manoj", "Sanjay", "Deepak", "Prakash", "Nabin", "Roshan", "Anil",
  "Bikash", "Dinesh", "Gopal", "Kiran", "Mohan", "Narayan", "Prem",
  "Raju", "Santosh", "Tilak", "Umesh", "Yogesh", "Binod", "Dilli", "Himal",
]

const femaleFirstNames = [
  "Sita", "Gita", "Rita", "Mina", "Anita", "Sunita", "Kamala", "Sarita",
  "Pramila", "Laxmi", "Durga", "Maya", "Nirmala", "Sabina", "Rekha",
  "Bindu", "Devi", "Jamuna", "Kopila", "Radha", "Shanti", "Tulsi",
  "Uma", "Yamuna", "Bimala", "Chanda", "Indira", "Kanchi", "Parbati", "Sushila",
]

const lastNames = [
  "Shrestha", "Tamang", "Maharjan", "Dangol", "Shakya", "Bajracharya",
  "Lama", "Thapa", "Gurung", "Magar", "Rai", "Limbu", "Newar",
  "Karmacharya", "Manandhar", "Pradhan", "Rajbhandari", "Tuladhar",
  "Amatya", "Joshi", "Prajapati", "Duwal", "Chitrakar", "Singh", "Adhikari",
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateVoters(count: number): Voter[] {
  const voters: Voter[] = []

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.48 ? (Math.random() > 0.97 ? "Other" : "Male") : "Female"
    const firstName = gender === "Male" || gender === "Other"
      ? randomItem(maleFirstNames)
      : randomItem(femaleFirstNames)
    const lastName = randomItem(lastNames)
    const municipality = randomItem(municipalities)
    const wardNum = Math.floor(Math.random() * 13) + 1
    const boothNum = Math.floor(Math.random() * 8) + 1

    voters.push({
      voter_id: `KV1-${String(i + 1).padStart(6, "0")}`,
      name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 62) + 18,
      gender,
      parent_name: `${randomItem(maleFirstNames)} ${lastName}`,
      spouse: Math.random() > 0.35 ? `${gender === "Male" ? randomItem(femaleFirstNames) : randomItem(maleFirstNames)} ${randomItem(lastNames)}` : "",
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}&backgroundColor=2563eb`,
      municipality,
      ward: `Ward ${wardNum}`,
      booth: `Booth ${boothNum}`,
    })
  }

  return voters
}

export const sampleVoters: Voter[] = generateVoters(500)

export function parseCsvToVoters(csvText: string): Voter[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"))

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] || ""
    })

    return {
      voter_id: obj.voter_id || "",
      name: obj.name || "",
      age: parseInt(obj.age) || 0,
      gender: obj.gender || "",
      parent_name: obj.parent_name || "",
      spouse: obj.spouse || "",
      picture: obj.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(obj.name || "V")}&backgroundColor=2563eb`,
      municipality: obj.municipality || "",
      ward: obj.ward || "",
      booth: obj.booth || "",
    }
  }).filter((v) => v.voter_id && v.name)
}
