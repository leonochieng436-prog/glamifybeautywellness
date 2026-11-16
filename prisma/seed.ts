import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HERO_SLIDE_SEEDS } from "../src/lib/hero-slides";
import { COLLECTION_SEEDS } from "../src/lib/collections";
const db = new PrismaClient();
const cats = [["Pills","pills"],["Gummies","gummies"],["Gels","gels"]];
const items = [
 ["pills","Radiance Daily Capsules","radiance-daily-capsules","Daily beauty-support capsules.",2400,null,40,true,false],
 ["gummies","Collagen Berry Gummies","collagen-berry-gummies","Chewable gummies with added collagen.",2800,2400,25,true,true],
 ["gels","Hydra Aloe Gel","hydra-aloe-gel","Lightweight aloe-based moisturising gel.",1600,null,60,false,true]];
async function main(){
 await db.adminUser.upsert({where:{email:process.env.ADMIN_EMAIL??"admin@example.com"},update:{},create:{email:process.env.ADMIN_EMAIL??"admin@example.com",name:"Admin",role:"ADMIN",passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD??"ChangeMe123!",12)}});
 await db.storeSettings.upsert({where:{id:1},update:{},create:{businessName:"Your Store",whatsappNumber:"254738783355",phone:"+254738783355",location:"Nairobi CBD",announcement:"Free delivery on orders over KES 5,000"}});
 if(!(await db.faq.count())) await db.faq.createMany({data:[{question:"How do I order?",answer:"Add items to your cart, enter your delivery details and send the order to us on WhatsApp. We confirm availability and delivery with you.",position:1},{question:"When do I pay?",answer:"Your order is confirmed by the store first. We will share payment details on WhatsApp.",position:2}]});
 for(const [n,s] of cats) await db.productCategory.upsert({where:{slug:s},update:{},create:{name:n,slug:s}});
 for(const [c,n,s,d,p,dp,q,f,b] of items as any[]){
  const cat=await db.productCategory.findUniqueOrThrow({where:{slug:c}});
  await db.product.upsert({where:{slug:s},update:{},create:{name:n,slug:s,shortDescription:d,description:d+" Replace with verified product documentation before launch.",priceKes:p,discountPriceKes:dp,isFeatured:f,isBestSeller:b,categoryId:cat.id,inventory:{create:{quantity:q}}}});
 }
 for (const collection of COLLECTION_SEEDS) {
  await db.collection.upsert({ where: { slug: collection.slug }, update: collection, create: collection });
 }
 for (const [index, slide] of HERO_SLIDE_SEEDS.entries()) {
  const id = `seed-hero-${String(index + 1).padStart(2, "0")}`;
  await db.heroSlide.upsert({ where: { id }, update: slide, create: { id, ...slide } });
 }
}
main().finally(()=>db.$disconnect());
