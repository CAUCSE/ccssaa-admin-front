export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  order: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
}

export interface DesignSettings {
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  faviconUrl?: string
}

