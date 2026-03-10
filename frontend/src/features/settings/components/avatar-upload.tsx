import { Icon } from '@/components/ui/material-icon'
import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'

interface AvatarUploadProps {
    user: {
        name: string
        avatar?: string
        email: string
    }
}

export function AvatarUpload({ user }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const initialize = useAuthStore((state) => state.auth.initialize)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setIsUploading(true)

        try {
            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            }

            const compressedFile = await imageCompression(file, options)

            const formData = new FormData()
            formData.append('avatar', compressedFile)

            await authApi.updateProfile(formData)
            await initialize() // Refresh user data
            toast.success('Avatar updated successfully')
        } catch (error: any) {
            console.error('Avatar upload failed:', error)
            const errorMessage = error?.response?.data?.detail || 
                                error?.response?.data?.message || 
                                error?.response?.data?.avatar?.[0] ||
                                error?.message || 
                                'Failed to upload avatar'
            toast.error(errorMessage)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="flex items-center gap-x-4">
            <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Icon name="progress_activity" className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Icon name="upload" className="mr-1.5 h-3.5 w-3.5" />
                                    Change Avatar
                                </>
                            )}
                        </Button>
                    </div>
                </Label>
                <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max 5MB.
                </p>
            </div>
        </div>
    )
}
