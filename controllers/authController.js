import userModel from '../models/userModel.js'
import { comparePassword, hashPassword } from '../utils/authUtil.js'
import JWT from 'jsonwebtoken'

export const registerController=async(req,res)=>{
    try {
        const {name,email,password,phone,address}=req.body
        if(!name){
            return res.send({message:'Name is required'})
        }
        if(!email){
            return res.send({message:'Email is required'})
        }
        if(!password){
            return res.send({message:'Password is required'})
        }
        if(!address){
            return res.send({message:'Address is required'})
        }
        if(!phone){
            return res.send({message:'Phone is required'})
        }

        const existingUser=await userModel.findOne({email})

        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'Already existing user please login'
            })
        }

        const hashedPassword=await hashPassword(password)

        const user= await new userModel({name,email,phone,address,password:hashedPassword}).save()

        res.status(201).send({
            success:true,
            message:'User registered successfully',
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in registration',
            error
        })
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            });
        }

        // Compare password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid Password'
            });
        }

        // Generate JWT token
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Send response
        res.status(200).send({
            success: true,
            message: 'Login successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            },
            token,
        });
    } catch (error) {
        console.log('Error in login controller:', error);
        res.status(500).send({
            success: false,
            message: 'Error in Login',
            error: error.message || error
        });
    }
};

export const testController=(req,res)=>{
    res.send('Protected Route')
}

