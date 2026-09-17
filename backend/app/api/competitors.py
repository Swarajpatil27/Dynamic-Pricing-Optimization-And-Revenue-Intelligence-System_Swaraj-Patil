from fastapi import APIRouter, Query

router = APIRouter(
    prefix="/api/v1/competitors",
    tags=["Competitor Intelligence"],
)


@router.get("/comparison-report")
def comparison_report(
    product_name: str = Query("Apple iPhone Charger"),
    our_price: float = Query(19.99),
    cost_price: float = Query(13.99),
):
    """
    Demo competitor comparison.

    This version intentionally uses dummy competitor data.
    No SerpApi, scraping, or external marketplace API is used.
    """

    # ---------------------------------------------------------
    # DUMMY COMPETITOR PRICES
    # ---------------------------------------------------------

    amazon_price = round(our_price * 0.96, 2)
    walmart_price = round(our_price * 0.98, 2)
    flipkart_price = round(our_price * 1.04, 2)
    bestbuy_price = round(our_price * 1.06, 2)

    prices = [
        amazon_price,
        walmart_price,
        flipkart_price,
        bestbuy_price,
    ]

    lowest_competitor = min(prices)

    average_competitor = round(
        sum(prices) / len(prices),
        2,
    )

    undercutting_count = sum(
        price < our_price
        for price in prices
    )

    # ---------------------------------------------------------
    # MARKET POSITION
    # ---------------------------------------------------------

    if our_price <= lowest_competitor:
        market_position = "Competitive (Below Market Floor)"
    else:
        market_position = "Competitive Value"

    # ---------------------------------------------------------
    # THREAT LEVEL
    # ---------------------------------------------------------

    threat_level = (
        "High"
        if undercutting_count >= 2
        else "Medium"
    )

    # ---------------------------------------------------------
    # BAR CHART DATA
    # ---------------------------------------------------------

    bar_data = [
        {
            "platform": "Our Store",
            "price": our_price,
        },
        {
            "platform": "Amazon",
            "price": amazon_price,
        },
        {
            "platform": "Walmart",
            "price": walmart_price,
        },
        {
            "platform": "Flipkart",
            "price": flipkart_price,
        },
        {
            "platform": "Best Buy",
            "price": bestbuy_price,
        },
    ]

    # ---------------------------------------------------------
    # LINE CHART DATA
    # ---------------------------------------------------------

    line_data = [
        {
            "date": "Day -5",
            "OurPrice": our_price,
            "Amazon": round(amazon_price * 1.02, 2),
            "Walmart": round(walmart_price * 1.01, 2),
        },
        {
            "date": "Day -4",
            "OurPrice": our_price,
            "Amazon": round(amazon_price * 1.01, 2),
            "Walmart": round(walmart_price * 1.00, 2),
        },
        {
            "date": "Day -3",
            "OurPrice": our_price,
            "Amazon": round(amazon_price * 1.00, 2),
            "Walmart": round(walmart_price * 0.99, 2),
        },
        {
            "date": "Day -2",
            "OurPrice": our_price,
            "Amazon": round(amazon_price * 0.99, 2),
            "Walmart": round(walmart_price * 1.02, 2),
        },
        {
            "date": "Day -1",
            "OurPrice": our_price,
            "Amazon": round(amazon_price * 0.98, 2),
            "Walmart": round(walmart_price * 1.03, 2),
        },
        {
            "date": "Today",
            "OurPrice": our_price,
            "Amazon": amazon_price,
            "Walmart": walmart_price,
        },
    ]

    # ---------------------------------------------------------
    # COMPARISON TABLE
    # ---------------------------------------------------------

    comparison_table = [
        {
            "platform": "Amazon",
            "competitor_price": amazon_price,
            "our_price": our_price,
            "price_difference": round(
                amazon_price - our_price,
                2,
            ),
            "is_undercutting": amazon_price < our_price,
            "stock_status": "In Stock",
        },
        {
            "platform": "Walmart",
            "competitor_price": walmart_price,
            "our_price": our_price,
            "price_difference": round(
                walmart_price - our_price,
                2,
            ),
            "is_undercutting": walmart_price < our_price,
            "stock_status": "In Stock",
        },
        {
            "platform": "Flipkart",
            "competitor_price": flipkart_price,
            "our_price": our_price,
            "price_difference": round(
                flipkart_price - our_price,
                2,
            ),
            "is_undercutting": flipkart_price < our_price,
            "stock_status": "Low Stock",
        },
        {
            "platform": "Best Buy",
            "competitor_price": bestbuy_price,
            "our_price": our_price,
            "price_difference": round(
                bestbuy_price - our_price,
                2,
            ),
            "is_undercutting": bestbuy_price < our_price,
            "stock_status": "In Stock",
        },
    ]

    # ---------------------------------------------------------
    # FINAL REPORT
    # ---------------------------------------------------------

    return {
        "report_id": "INTEL-19784",

        "product_name": product_name,

        "our_price": our_price,

        "cost_price": cost_price,

        "market_position": market_position,

        "threat_level": threat_level,

        "summary": {
            "lowest_competitor_price": lowest_competitor,
            "average_competitor_price": average_competitor,
            "undercutting_count": undercutting_count,
        },

        "comparison_table": comparison_table,

        "bar_data": bar_data,

        "line_data": line_data,
    }