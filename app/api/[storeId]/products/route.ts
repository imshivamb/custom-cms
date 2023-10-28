import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(
    req: Request,
    {params}: { params: { storeId: string}}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, price, categoryId, description, affiliateLink, images } = body;

        if(!userId) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if(!name) {
            return new NextResponse("Name is required", { status: 400 })
        }
        if(!description) {
            return new NextResponse("Description isrequired", { status: 400 })
        }
        
        if(!categoryId) {
            return new NextResponse("Category ID is required", { status: 400 })
        }
        if(!affiliateLink) {
            return new NextResponse("Affiliate Link is required", { status: 400 })
        }
        if(!images || !images.length) {
            return new NextResponse("Image is required", { status: 400 })
        }

        if(!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if(!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                description,
                affiliateLink,
                categoryId,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);


    } catch (error) {
        console.log('[PRODUCTS_POST]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}


export async function GET(
    req: Request,
    {params}: { params: { storeId: string}}
) {
    try {

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        if(!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId
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