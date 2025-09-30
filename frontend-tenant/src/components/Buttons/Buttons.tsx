type props = {
    name:string;
    utility?: () => void;
    utility2?: () => void;
}


const Button = ({name, utility = () => {}, utility2 = () => {}}: props) => {

    const handleClick = () => {
        utility();
        utility2();
    }

    return(
        <button 
        type="submit" 
        className="flex self-center relative px-[50px] py-3 rounded-full bg-[#18A8A5] overflow-hidden"
        onClick={handleClick}
        >
            <span className="text-white text-sm font-extralight">{name}</span>
        </button>
    )
}

export default Button