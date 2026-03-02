import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, ShieldCheck, Mail } from 'lucide-react'

export default function PendingApprovalPage() {
    const { auth } = useAuthStore()
    const user = auth.user

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.1)] p-8 md:p-10 text-center">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Clock className="h-10 w-10 text-indigo-600" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                                <ShieldCheck className="h-4 w-4 text-white" />
                            </span>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        Awaiting Approval
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Your account has been created and your email is verified.<br />
                        An <span className="font-semibold text-indigo-600">administrator</span> still needs to
                        approve your access before you can enter the platform.
                    </p>

                    {/* Info box */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 text-left space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                            <Mail className="h-3.5 w-3.5" />
                            Account Details
                        </div>
                        {user?.email && (
                            <p className="text-sm text-gray-700 font-medium">{user.email}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            You'll be able to access your dashboard once an admin reviews and approves your request.
                            This usually takes less than 24 hours.
                        </p>
                    </div>

                    {/* CTA */}
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        onClick={() => auth.logout()}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    DzeNhare SQB · Secure Platform Access
                </p>
            </div>
        </div>
    )
}
