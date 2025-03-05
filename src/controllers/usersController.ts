import { Request, Response } from "express";
import { hashPassword } from "../services/password.service";
import prisma from "../models/user"
import user from "../models/user";
import { error } from "console";

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        const hashedPasword = await hashPassword(password)
        if (!password) {
            res.status(400).json({ message: 'La contraseña es obligatoria' })
            return
        }
        if (!email) {
            res.status(400).json({ message: 'El mail es obligatorio' })
            return
        }
        const user = await prisma.create(
            {
                data: {
                    email,
                    password: hashedPasword
                }
            }
        )
        res.status(201).json(user)
    } catch (error: any) {
        if (error?.code == 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: 'El mail ingresado ya existe' })
        }
        console.log(error)
        res.status(500).json({ error: 'Hubo un error, intente mas tarde' })
    }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.findMany()
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error, intente mas tarde' })
    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        const user = await prisma.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            res.status(404).json({ error: 'El usuario no fue encontrado' })
            return
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error, intente mas tarde' })
    }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    const { email, password } = req.body
    try {
        let dataToUpdate: any = { ...req.body }

        if (password) {
            const hashedPasword = await hashPassword(password)
            dataToUpdate.password = hashedPasword
        }
        if (!email) {
            dataToUpdate.email = email
        }
        const user = await prisma.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })
        res.status(200).json(user)
    } catch (error: any) {
        if (error?.code == 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ error: 'El mail ingresado ya existe' })
        } else if (error?.code == 'P2025') {
            res.status(404).json('Usuario no encontrado')
        } else {
            console.log(error)
            res.status(500).json({ error: 'Hubo un error, intente mas tarde' })
        }

    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        await prisma.delete({
            where: {
                id: userId
            }
        })
        res.status(200).json({
            message: `El usuario ${userId} ha sido eliminado`
        }).end()
    } catch (error: any) {
        if (error?.code == 'P2025') {
            res.status(404).json('Usuario no encontrado')
        } else {
            console.log(error)
            res.status(500).json({ error: 'Hubo un error, intente mas tarde' })
        }
    }
}