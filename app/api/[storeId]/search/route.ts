import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";


export async function GET(
    req: Request,
    { query }: { query: string }
) {
    
    try {

        
        if (!query) {
            return new NextResponse("Query is required", { status: 400 });
        }
        const products = await prismadb.product.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query, // Modify this to match your search criteria
                        },
                    },
                    {
                        description: {
                            contains: query, // Modify this to match your search criteria
                        },
                    },
                ],
            },
            include: {
                images: true,
                category: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products);


    } catch (error) {
        console.log('[PRODUCTS_GET]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}