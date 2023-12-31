import { createClient } from "contentful";
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Image from 'next/image'
import Skeleton from "../../components/Skeleton";


const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
})

export const getStaticPaths = async () => {
    const response = await client.getEntries({ content_type: 'recipe' })

    const paths = response.items.map(item => {
        return {
            params: { slug: item.fields.slug }
        }
    })

    return {
        paths,
        fallback: true
    }
}

export async function getStaticProps({ params }) {
    const { items } = await client.getEntries({
        content_type: 'recipe',
        'fields.slug': params.slug
    })

    if(!items.length) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    return {
        props: { recipe: items[0] },
        revalidate: 10,
    }
}


export default function RecipeDetails({ recipe }) {
    if (!recipe) return <Skeleton/>

    const { featuredImage, title, cookingTime, ingredients, method } = recipe.fields;
    const { file: imgData } = featuredImage.fields;

  return (
      <div>
          <div className="banner">
              <Image
                  src={'https:' + imgData.url}
                  width={imgData.details.image.width}
                  height={imgData.details.image.height}
                  alt=""
                  style={{
                      maxWidth: '100%',
                      objectFit: 'contain',
                }}
              />
              <h2>{ title }</h2>
          </div>

          <div className="info">
              <p>Cooking time: { cookingTime } mins</p>
              <h3>Ingredients:</h3>

              <ul>
                  {ingredients.map(ing => (
                      <li key={ing}>{ ing }</li>
                  ))}
              </ul>
          </div>

          <div className="method">
              <h3>Method:</h3>
              <div>{documentToReactComponents(method)}</div>
          </div>

          <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
      </div>
  )
}