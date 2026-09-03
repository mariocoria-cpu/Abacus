export interface ScriptInput {
  topic: string
  format: string
  tone: string
  audience: string
  duration: string
  channelName?: string
}

export interface GeneratedScript {
  scriptContent: string
  thumbnailOptions: string[]
  titleOptions: string[]
  description: string
  hashtags: string[]
  hookText: string
}

export interface UserUsage {
  plan: string
  scriptsUsed: number
  scriptsLimit: number
  subscriptionStatus: string | null
}
