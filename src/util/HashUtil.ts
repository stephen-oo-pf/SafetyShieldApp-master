const Hashes = require('jshashes');

export default class HashUtil{

    private static _md5:any = new Hashes.MD5();
    private static _sha1:any = new Hashes.SHA1();


    static md5($value:string):string{
        return this._md5.hex($value);
    }

    static sha1($value:string):string{
        return this._sha1.hex($value);
    }
    

    static base64Encode($value:string){

        let encoded:string = "";
        try{
            encoded = window.btoa($value);
        }catch($error){
            encoded = "";
        }
        return encoded;
    }
    static base64Decode($value:string){

        let decoded:string = "";
        try{
            decoded = window.atob($value);
        }catch($error){
            decoded = "";
        }
        return decoded;
    }


}