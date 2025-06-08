import { useState, useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "@/components/user-avatar"
import Image from "next/image"

// Array of predefined avatar options
const AVATAR_OPTIONS = [
  { id: 'default', src: null },
  { id: 'avatar1', src: '/images/avatars/avatar1.png' },
  { id: 'avatar2', src: '/images/avatars/avatar2.png' },
  { id: 'avatar3', src: '/images/avatars/avatar3.png' },
  { id: 'avatar4', src: '/images/avatars/avatar4.png' },
  { id: 'avatar5', src: '/images/avatars/avatar5.png' },
  { id: 'avatar6', src: '/images/avatars/avatar6.png' },
  { id: 'avatar7', src: '/images/avatars/avatar7.png' },
  { id: 'avatar8', src: '/images/avatars/avatar8.png' },
  { id: 'custom', src: 'custom' }
]

// Array of Liara avatars
const LIARA_AVATARS = [
  { id: 'liara1', src: 'https://avatar.iran.liara.run/public/1' },
  { id: 'liara2', src: 'https://avatar.iran.liara.run/public/2' },
  { id: 'liara3', src: 'https://avatar.iran.liara.run/public/3' },
  { id: 'liara4', src: 'https://avatar.iran.liara.run/public/4' },
  { id: 'liara5', src: 'https://avatar.iran.liara.run/public/5' },
  { id: 'liara6', src: 'https://avatar.iran.liara.run/public/6' },
  { id: 'liara7', src: 'https://avatar.iran.liara.run/public/7' },
  { id: 'liara8', src: 'https://avatar.iran.liara.run/public/8' },
]

export function AvatarSelector({ value, onChange, userData }) {
  const [selectedOption, setSelectedOption] = useState('default')
  const [customUrl, setCustomUrl] = useState('')
  
  // Initialize the component with the current value
  useEffect(() => {
    if (value) {
      // Check if the value matches one of our predefined avatars
      const predefinedAvatar = AVATAR_OPTIONS.find(option => 
        option.src === value && option.id !== 'custom' && option.id !== 'default'
      )
      
      // Check if it matches one of the Liara avatars
      const liaraAvatar = LIARA_AVATARS.find(option => 
        option.src === value
      )
      
      if (predefinedAvatar) {
        setSelectedOption(predefinedAvatar.id)
      } else if (liaraAvatar) {
        setSelectedOption(liaraAvatar.id)
      } else if (value) {
        // If not a predefined avatar but has a value, it's a custom URL
        setSelectedOption('custom')
        setCustomUrl(value)
      } else {
        // Default/no avatar case
        setSelectedOption('default')
      }
    }
  }, [value])
  
  // Handle option change
  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId)
    
    // If default or predefined avatar is selected, update with the src
    if (optionId === 'default') {
      onChange(null)
    } else if (optionId === 'custom') {
      onChange(customUrl || '') // Use existing custom URL if available
    } else {
      // Check if it's one of the predefined avatars
      const predefAvatar = AVATAR_OPTIONS.find(option => option.id === optionId)
      if (predefAvatar) {
        onChange(predefAvatar.src)
        return
      }
      
      // Check if it's one of the Liara avatars
      const liaraAvatar = LIARA_AVATARS.find(option => option.id === optionId)
      if (liaraAvatar) {
        onChange(liaraAvatar.src)
      }
    }
  }
  
  // Handle custom URL change
  const handleCustomUrlChange = (e) => {
    const url = e.target.value
    setCustomUrl(url)
    
    // Only update the value if custom option is currently selected
    if (selectedOption === 'custom') {
      onChange(url)
    }
  }
  
  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedOption} 
        onValueChange={handleOptionChange}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
      >
        {/* Default Avatar (User Initials) */}
        <div className="flex flex-col items-center gap-2">
          <RadioGroupItem 
            value="default" 
            id="avatar-default" 
            className="sr-only"
          />
          <Label 
            htmlFor="avatar-default" 
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className={`rounded-full p-1 border-2 transition-colors ${
              selectedOption === 'default' 
                ? 'border-primary' 
                : 'border-transparent hover:border-primary/50'
            }`}>
              <UserAvatar user={userData} size="lg" />
            </div>
            <span className="text-xs">Default</span>
          </Label>
        </div>
        
        {/* Predefined Avatars */}
        {AVATAR_OPTIONS.slice(1, -1).map((avatar) => (
          <div key={avatar.id} className="flex flex-col items-center gap-2">
            <RadioGroupItem 
              value={avatar.id} 
              id={`avatar-${avatar.id}`} 
              className="sr-only"
            />
            <Label 
              htmlFor={`avatar-${avatar.id}`} 
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className={`rounded-full p-1 border-2 transition-colors ${
                selectedOption === avatar.id 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-primary/50'
              }`}>
                <div className="h-16 w-16 rounded-full overflow-hidden relative">
                  <Image 
                    src={avatar.src} 
                    alt={`Avatar option ${avatar.id}`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-xs capitalize">{avatar.id.replace(/[0-9]/g, ' $&')}</span>
            </Label>
          </div>
        ))}

        {/* Liara Avatars */}
        {LIARA_AVATARS.map((avatar) => (
          <div key={avatar.id} className="flex flex-col items-center gap-2">
            <RadioGroupItem 
              value={avatar.id} 
              id={`avatar-${avatar.id}`} 
              className="sr-only"
            />
            <Label 
              htmlFor={`avatar-${avatar.id}`} 
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className={`rounded-full p-1 border-2 transition-colors ${
                selectedOption === avatar.id 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-primary/50'
              }`}>
                <div className="h-16 w-16 rounded-full overflow-hidden relative">
                  <Image 
                    src={avatar.src} 
                    alt={`Avatar option ${avatar.id}`}
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <span className="text-xs capitalize">{avatar.id.replace(/liara/g, 'Style ').replace(/[0-9]/g, ' $&')}</span>
            </Label>
          </div>
        ))}
        
        {/* Custom URL Option */}
        <div className="flex flex-col items-center gap-2">
          <RadioGroupItem 
            value="custom" 
            id="avatar-custom" 
            className="sr-only"
          />
          <Label 
            htmlFor="avatar-custom" 
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className={`rounded-full p-1 border-2 transition-colors ${
              selectedOption === 'custom' 
                ? 'border-primary' 
                : 'border-transparent hover:border-primary/50'
            }`}>
              <div className="h-16 w-16 rounded-full overflow-hidden relative bg-muted flex items-center justify-center">
                {customUrl ? (
                  <Image 
                    src={customUrl} 
                    alt="Custom avatar" 
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.src = '/images/avatar-placeholder.png'
                    }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Custom</span>
                )}
              </div>
            </div>
            <span className="text-xs">Custom URL</span>
          </Label>
        </div>
      </RadioGroup>
      
      {/* Custom URL Input */}
      {selectedOption === 'custom' && (
        <div className="pt-2">
          <Label htmlFor="custom-avatar-url" className="text-sm">
            Enter image URL:
          </Label>
          <input
            id="custom-avatar-url"
            type="url"
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="https://example.com/your-avatar.jpg"
            className="mt-1 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a valid image URL for your custom avatar
          </p>
        </div>
      )}
    </div>
  )
} 