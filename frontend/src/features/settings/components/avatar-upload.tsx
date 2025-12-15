import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
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
        } catch (error) {
            console.error('Avatar upload failed:', error)
            toast.error('Failed to upload avatar')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="flex items-center gap-x-6">
            <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
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
