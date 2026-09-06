import { ArrowLeft } from "lucide-react"
import type React from "react"
import { useNavigate } from "react-router-dom"

interface props {
    navigateTo?:string
    showText?:boolean
}

export const BackButton:React.FC<props> = ({navigateTo, showText}) => {
    const navigate = useNavigate()
    return(
        <div className="flex flex-row gap-2 items-center" onClick={()=>{
            if(navigateTo) navigate(navigateTo)
            else navigate(-1)
        }}>
            <ArrowLeft />
            {showText && <p className="text-sm font-medium text-text-main">Kembali</p>}
        </div>
    )
}