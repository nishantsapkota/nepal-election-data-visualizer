export interface Voter {
  voter_id: string
  name: string
  age: number
  gender: string
  parent_name: string
  spouse: string
  picture: string
  municipality: string
  ward: string
  booth: string
}

export interface FilterState {
  search: string
  gender: string
  municipality: string
  ward: string
  booth: string
  ageRange: [number, number]
}

export interface ChartDataItem {
  name: string
  value: number
  fill?: string
}

export interface MunicipalityData {
  name: string
  wards: string[]
  booths: string[]
  voterCount: number
  maleCount: number
  femaleCount: number
  otherCount: number
}
