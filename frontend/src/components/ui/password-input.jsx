import * as React from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

// A password field with a clear (✕) button and a show/hide (eye) toggle,
// both right-aligned. Clear only appears once there's something to clear.
const PasswordInput = React.forwardRef(({ className, value, onChange, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const handleClear = () => {
        // mimic a real change event so parent onChange handlers work unmodified
        onChange?.({ target: { name: props.name, value: "" } });
    };

    return (
        <div className="relative">
            <Input
                ref={ref}
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                className={cn("pr-16", className)}
                {...props}
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                {
                    value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            tabIndex={-1}
                            aria-label="Clear password"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )
                }
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    tabIndex={-1}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
