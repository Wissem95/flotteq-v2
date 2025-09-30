


const SaisieVerification = () => {

    return(
        <div className="flex justify-center items-center h-screen bg-slate-700">
            <div className="flex flex-col items-center w-[500px] bg-white/10 backdrop-blur-md border border-white/75 rounded-3xl p-8 text-white shadow-lg gap-[30px]">
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl">Saisissez le code reçu</h2>
                    <p className="text-[10px]">code envoyé sur ma*****@gmail.com</p>
                </div>
                <div className="flex gap-3">
                    <div className="h-8 w-8 bg-white"></div>
                    <div className="h-8 w-8 bg-white"></div>
                    <div className="h-8 w-8 bg-white"></div>
                    <div className="h-8 w-8 bg-white"></div>
                </div>
                
            </div>
        </div>
    )
}

export default SaisieVerification