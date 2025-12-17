import nodemailer from "nodemailer";

const Backend_url = "https://api.freshoralaundry.com";
// const Backend_url = "http://localhost:4000";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "freshorappc@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "borm bxii pjkp cnzc", // Gmail App Password
      },
    });
  }

  async sendOrderConfirmation({
    customerEmail,
    customerName,
    orderNumber,
    orderDetails,
  }) {
    // ... (rest of the method is unchanged)
    // console.log("[CUSTOMER-EMAIL]", customerEmail);
    // console.log("[CUSTOMER-NAME]", customerName);
    // console.log("[ORDER-NUMBER]", orderNumber);
    // console.log("[ORDER-DETAILS]", orderDetails);
    const {
      name,
      customerInfo,
      pickupInfo,
      deliveryInfo,
      cartItems,
      totalAmount,
      paymentMethod,
    } = orderDetails;

    const itemsList = await cartItems
      .map(
        (item) =>
          `• ${item.name} (${item.category}) - Qty: ${item.quantity} - AED${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const customerMailOptions = {
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: `🧺 Order Confirmation - ${orderNumber} | Your Laundry is in Good Hands!`,
      html: this.generateCustomerBrochureHTML(
        customerName,
        orderNumber,
        orderDetails
      ),
      // attachments: [
      //   {
      //     filename: "FL-logo.png",
      //     path: "./public/images/FL-logo.png",
      //     cid: "logo",
      //   },
      //   {
      //     filename: "Washing.png",
      //     path: "./public/images/Washing.png",
      //     cid: "washing",
      //   },
      //   {
      //     filename: "Facebook.png",
      //     path: "./public/images/Facebook.png",
      //     cid: "facebook",
      //   },
      //   {
      //     filename: "Whatsapp.png",
      //     path: "./public/images/Whatsapp.png",
      //     cid: "whatsapp",
      //   },
      //   {
      //     filename: "Instagram.png",
      //     path: "./public/images/Instagram.png",
      //     cid: "instagram",
      //   },
      // ],
    };

    const businessMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // Business email
      subject: `📋 New Order Received - ${orderNumber}`,
      html: this.generateBusinessNotificationHTML(
        customerName,
        orderNumber,
        orderDetails
      ),
    };

    try {
      await Promise.all([
        this.transporter.sendMail(customerMailOptions),
        this.transporter.sendMail(businessMailOptions),
      ]);
      console.log(
        `✅ Order confirmation emails sent to customer (${customerEmail}) and business`
      );
    } catch (error) {
      console.error("❌ Failed to send order confirmation emails:", error);
      throw error;
    }
  }

  async sendStatusUpdate({
    customerEmail,
    customerName,
    orderNumber,
    newStatus,
    notes,
  }) {
    // ... (rest of the method is unchanged)
    const statusMessages = {
      CONFIRMED: "Your order has been confirmed and is being prepared.",
      PICKED_UP:
        "Your items have been picked up and are on their way to our facility.",
      IN_PROGRESS: "Your items are currently being processed.",
      READY: "Great news! Your order is ready for delivery.",
      OUT_FOR_DELIVERY: "Your order is out for delivery and will arrive soon.",
      DELIVERED:
        "Your order has been successfully delivered. Thank you for choosing our service!",
      CANCELLED:
        "Your order has been cancelled. If you have any questions, please contact us.",
    };

    const emailContent = `
Dear ${customerName},

Your laundry order status has been updated.

Order Number: ${orderNumber}
New Status: ${newStatus}

${statusMessages[newStatus] || "Your order status has been updated."}

${notes ? `Additional Notes: ${notes}` : ""}

Track your order: ${process.env.FRONTEND_URL}/track/${orderNumber}

Best regards,
The Laundry Service Team
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: `Order Update - ${orderNumber} - ${newStatus}`,
      text: emailContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Status update email sent to ${customerEmail}`);
    } catch (error) {
      console.error("❌ Failed to send status update email:", error);
      throw error;
    }
  }

  generateCustomerBrochureHTML(customerName, orderNumber, orderDetails) {
    const { cartItems, totalAmount } = orderDetails;

    const itemsHTML = cartItems
      .map(
        (item) => `
   <tr>
              <td
                style="
                  padding: 12px;
                  border-bottom: 1px solid #e5e7eb;
                  font-weight: 500;
                "
              >
                ${item.name}
              </td>
              <td
                style="
                  padding: 12px;
                  border-bottom: 1px solid #e5e7eb;
                  font-weight: 500;
                "
              >
                ${item.serviceSlug}
              </td>
              <td
                style="
                  padding: 12px;
                  border-bottom: 1px solid #e5e7eb;
                  color: #6b7280;
                "
              >
                ${item.category}
              </td>
              <td
                style="
                  padding: 12px;
                  border-bottom: 1px solid #e5e7eb;
                  text-align: center;
                  font-weight: 600;
                "
              >
                ${item.quantity}
              </td>
              <td
                style="
                  padding: 12px;
                  border-bottom: 1px solid #e5e7eb;
                  text-align: right;
                  font-weight: 600;
                  color: #16a34a;
                "
              >
                AED ${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
    `
      )
      .join("");

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Order Confirmation - Freshora Laundry</title>
  </head>
  <body
    style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    "
  >
    <div
      style="
        max-width: 800px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      "
    >
      <div
        style="
          background: white;

          padding: 30px 30px;
          text-align: left;
          position: relative;
          border-top: 5px solid #16a34a;
          border-bottom: 5px solid #6b7280;
        "
      >
        <table style="width: 100%">
          <tr>
            <td>
              <img
                src="${Backend_url}/images/FL-logo.png"
                alt="Freshora-logo"
                width="140"
                style="display: block"
              />
            </td>
            <td>
              <h2
                style="
                  color: #16a34a;
                  margin: 0 0 10px 0;
                  font-size: 64px;
                  font-weight: 600;
                  text-align: center;
                "
              >
                <span>Order</span> <span style="color: black">Confirmed!</span>
              </h2>
              <p
                style="
                  color: #6b7280;
                  font-size: 24px;
                  margin: 0;
                  text-align: center;
                "
              >
                Your laundry order has been recieved
              </p>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 30px">
        <div
          style="
            margin-bottom: 80px;
            padding: 0px 80px;
            color: #15803d;
            font-size: 18px;
          "
        >
          <h3>Hello ${customerName} !</h3>
          <p>Thank you for choosing Freshora Laundry!</p>
          <p>Your order has been confirmed and assigned tracking</p>
          <p>ID: ${orderNumber}</p>
        </div>

        <div style="width: 100%">
          <table style="width: 100%;  max-width: 700px" >
            <thead>
              <tr>
                <th>Items</th>
                <th>Service</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td align="right">
                  <p
                    style="
                      margin: 0;
                      color: #16a34a;
                      font-weight: 700;
                      font-size: 18px;
                    "
                  >
                    AED ${totalAmount.toFixed(2)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding: 30px">
          <h3 style="font-weight: 600; color: #15803d">
            Terms & Conditions - Freshora Laundry LLC
          </h3>
          <ul style="color: #15803d">
            <li>Items not collected within 30 days may be disposed of.</li>
            <li>
              We are not responsible for valuables left in pockets or garments
            </li>
            <li>
              Color fading, shrinkage, or texture change may occur due to fabric
              quality
            </li>
            <li>No claim accepted after 7 days of delivery</li>
            <li>100% stain removal not guaranteed</li>
            <li>
              Delicate, leather and designer items handled at owner's risk
            </li>
            <li>
              Shoe, bag, carpet and curtain results may vary depending on
              condition
            </li>
            <li>Express services subject to availability and extra charge</li>
            <li>
              Inspect items upon delivery, report any issues within 24 hours
            </li>
          </ul>
        </div>
      </div>
      <div
        style="max-width: 800px; padding: 20px 80px; background-color: #15803d"
      >
        <table>
          <tr>
            <td>
              <div style="color: white; line-height: 10px">
                <p style="font-size: 20px; font-weight: 300">
                  We Keep Your Clothes Fresh
                </p>
                <h2 style="font-size: 40px; font-weight: 700">Laundry</h2>
                <h2 style="font-size: 40px; font-weight: 700">Services</h2>
                <p style="font-size: 47px; font-weight: 200">Made Simple</p>
                <a
                  href="https://www.freshoralaundry.com"
                  style="
                    font-size: 20px;
                    font-weight: 400;
                    text-decoration: none;
                    color: white;
                  "
                >
                  www.freshoralaundry.com
                </a>
              </div>
            </td>
            <td align="right">
              <img
                src="${Backend_url}/images/Washing.png"
                alt="Washing-machine"
                width="341"
              />
            </td>
          </tr>
        </table>
      </div>
      <div
        style="
          background: #171717;
          border-top: 3px solid white;
          color: #d1d5db;
          padding: 20px 80px;
          text-align: left;
        "
      >
        <table>
          <thead style="color: #15803d; font-size: 24px; font-weight: 600">
            <tr>
              <th>Address</th>
              <th style="width: 20px"></th>
              <th>Contacts</th>
            </tr>
          </thead>
          <tbody style="font-size: 16px; font-weight: 400">
            <tr>
              <td>
                <div style="text-wrap: nowrap">
                  <div>Shop no 4, Azizi Riviera 42,</div>
                  <div>Meydan, Al Merkadh,</div>
                  <div>Dubai UAE</div>
                </div>
              </td>
              <td></td>
              <td>
                <div style="text-wrap: nowrap">
                  <div>Monday - Friday : 8am to 8pm</div>
                  <div>Saturday - Sunday : 10am to 8pm</div>
                  <div>freshorappc@gmail.com</div>
                  <div>+971 50 925 9667</div>
                </div>
              </td>
              <td style="width: 20px"></td>
              <td align="right">
  <a href="https://www.facebook.com/profile.php?id=61579978694620"
     style="display:inline-block;text-decoration:none;"
     target="_blank">
    <img src="${Backend_url}/images/Facebook.png"
         alt="Facebook"
         width="40"
         style="display:inline-block;margin-right:10px;border:0;" />
  </a>

  <a href="https://wa.me/971509259667"
     style="display:inline-block;text-decoration:none;"
     target="_blank">
    <img src="${Backend_url}/images/Whatsapp.png"
         alt="WhatsApp"
         width="40"
         style="display:inline-block;margin-right:10px;border:0;" />
  </a>

  <a href="https://www.instagram.com/freshoralaundry/"
     style="display:inline-block;text-decoration:none;"
     target="_blank">
    <img src="${Backend_url}/images/Instagram.png"
         alt="Instagram"
         width="40"
         style="display:inline-block;border:0;" />
  </a>
</td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>

`;
  }

  generateBusinessNotificationHTML(customerName, orderNumber, orderDetails) {
    const { customerInfo, cartItems, totalAmount } = orderDetails;

    const itemsHTML = cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.serviceSlug
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.category
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">AED ${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>New Order Notification</title>
  </head>
  <body
    style="
      font-family: Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
        'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
    "
  >
    <div style="max-width: 800px; margin: 0 auto; padding: 20px">
      <div
        style="
          background: #2e6f40;
          color: white;
          padding: 20px;
          text-align: center;
          height: 180px;
        "
      >
        <h1 style="margin: 0; font-size: 64px; font-weight: 600">
          New Order Received
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 20px; font-weight: 600">
          Order #${orderNumber}
        </p>
      </div>
      <table
        width="100%"
        cellpadding="10"
        cellspacing="0"
        border="0"
        style="background: white"
      >
        <tr>
          <td width="50%" valign="top">
            <div>
              <h2
                style="color: #003d28; text-wrap: nowrap; font-weight: lighter"
              >
                Customer Information
              </h2>
              <div
                style="
                  background: #f3f6f4;
                  padding: 15px;
                  margin: 10px 0;
                  font-size: 16px;
                  border-radius: 10px;
                  border: 1px solid #cccccc;
                "
              >
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerInfo?.email || "N/A"}</p>
                <p><strong>Phone:</strong> ${customerInfo?.phone || "N/A"}</p>
                <p>
                  <strong>Address:</strong> ${customerInfo?.address || "N/A"}
                </p>
                ${
                  customerInfo?.city
                    ? `
                <p><strong>City:</strong> ${customerInfo.city}</p>
                `
                    : ""
                } ${
      customerInfo?.zipCode
        ? `
                <p><strong>Zip Code:</strong> ${customerInfo.zipCode}</p>
                `
        : ""
    }
              </div>
            </div>
          </td>
          <td width="50%" valign="top">
            <div>
              <h2 style="color: #003d28; font-weight: lighter">
                Order Details
              </h2>
              <div
                style="
                  background: #f3f6f4;
                  padding: 15px;
                  margin: 10px 0;
                  border-radius: 10px;
                  border: 1px solid #cccccc;
                "
              >
                <div style="display: flex; flex-direction: row; gap: 20px">
                  <p>
                    <strong>Pickup Date:</strong> ${new Date(
                      orderDetails.pickupInfo.date
                    ).toLocaleDateString()}
                  </p>
                  <p style="padding-left: 20px">
                    <strong>Pickup Time:</strong> ${
                      orderDetails.pickupInfo.time
                    }
                  </p>
                </div>

                
                <p><strong>Total Amount:</strong> AED ${totalAmount.toFixed(
                  2
                )}</p>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- order items -->
      <div style="grid-column-start: 1; grid-column-end: 3">
        <h2 style="color: #003d28; font-weight: lighter">Order Items</h2>
        <div
          style="
            width: 100%;
            padding: 10px;
            background-color: #f3f6f4;
            border-radius: 10px;
            border: 1px solid #cccccc;
          "
        >
          <table
            style="width: 100%; border-collapse: collapse; background: #f3f6f4"
          >
            <thead>
              <tr style="background: #606060; color: white">
                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                  "
                >
                  Item
                </th>
                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                  "
                >
                  Service
                </th>
                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                  "
                >
                  Category
                </th>
                <th
                  style="
                    padding: 10px;
                    text-align: center;
                    border-bottom: 2px solid #ddd;
                  "
                >
                  Qty
                </th>
                <th
                  style="
                    padding: 10px;
                    text-align: right;
                    border-bottom: 2px solid #ddd;
                  "
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>

    `;
  }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
