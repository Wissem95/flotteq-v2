import { useNavigate } from "react-router-dom"



const CodeVerification = () => {

    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate("/verification/saisie")
    }

    return (
        <div className="flex justify-center items-center h-screen bg-slate-700">
            <form 
            className="flex flex-col items-center w-[500px] bg-white/10 backdrop-blur-md border border-white/75 rounded-3xl p-8 text-white shadow-lg gap-[30px]"
            onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl">Entrez le code de vérification</h2>
                    <p className="text-[10px]">Choisissez votre méthode de vérification</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div>
                        <select name="method" required className="text-black rounded-[12px] w-[320px] h-[45px] px-[15px]">
                            <option value="Email">Email</option>
                            <option value="Sms">Sms</option>
                        </select>
                    </div>
                    <button 
                        type="submit"
                        className="flex self-center relative px-[50px] py-3 rounded-full bg-[#18A8A5] overflow-hidden disabled:opacity-50"
                      >
                        <span className="text-white text-sm font-extralight">
                          valider
                        </span>
                      </button>
                </div>
            </form>
        </div>

    )
}

export default CodeVerification