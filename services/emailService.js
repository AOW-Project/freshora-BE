import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "freshorappc@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "ykbl euac vysy dpta", // Gmail App Password
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
    // ... (this entire HTML template function is unchanged)
    const {
      name,
      customerInfo,
      pickupInfo,
      deliveryInfo,
      cartItems,
      totalAmount,
      paymentMethod,
    } = orderDetails;

    const itemsHTML = cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${
          item.name
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${
          item.category
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${
          item.quantity
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #16a34a;">AED${(
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
    <meta charset="utf-8">
    <title>Order Confirmation - Premium Laundry Service</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
    <div style="max-width: 650px; margin: 0 auto; background: white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 40px 30px; text-align: center; position: relative;">
            <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 36px;">🧺</span>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your laundry is in expert hands, Here is your tracking ID </p>
            <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${orderNumber}
            </div>
        </div>
        
        <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #16a34a; margin: 0 0 10px 0; font-size: 24px;">Hello ${customerName}! 👋</h2>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">Thank you for choosing our premium laundry service. Your order is confirmed, and we're excited to take care of your garments — we'll pick up your items within 1 hour!</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; display: flex; align-items: center;">
                    📋 <span style="margin-left: 8px;">Order Summary</span>
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px; font-weight: 500;">Service Type</p>
                        <p style="margin: 0; color: #1e293b; font-weight: 600;">${orderDetails.cartItems[0].serviceSlug
                          .replace("-", " ")
                          .toUpperCase()}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px; font-weight: 500;">Total Amount</p>
                        <p style="margin: 0; color: #16a34a; font-weight: 700; font-size: 18px;">AED${totalAmount.toFixed(
                          2
                        )}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px; font-weight: 500;">Pickup Date</p>
                        <p style="margin: 0; color: #1e293b; font-weight: 600;">${new Date(
                          orderDetails.pickupInfo.date
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</p>
                    </div>
                    ${
                      orderDetails.deliveryInfo.date
                        ? `
                    <div>
                        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px; font-weight: 500;">Delivery Date</p>
                        <p style="margin: 0; color: #1e293b; font-weight: 600;">${new Date(
                          orderDetails.deliveryInfo.date
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</p>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; display: flex; align-items: center;">
                    👕 <span style="margin-left: 8px;">Your Items</span>
                </h3>
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse; background: white;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="padding: 15px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #374151;">Item</th>
                                <th style="padding: 15px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #374151;">Category</th>
                                <th style="padding: 15px 12px; text-align: center; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #374151;">Qty</th>
                                <th style="padding: 15px 12px; text-align: right; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #374151;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${
              orderDetails.pickupInfo.instructions
                ? `
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #92400e; display: flex; align-items: center;">
                    📝 <span style="margin-left: 8px;">Special Instructions</span>
                </h4>
                <p style="margin: 0; color: #92400e; font-style: italic;">"${orderDetails.pickupInfo.instructions}"</p>
            </div>
            `
                : ""
            }
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 20px 0; color: #0c4a6e; font-size: 18px; display: flex; align-items: center;">
                    🚀 <span style="margin-left: 8px;">What Happens Next?</span>
                </h4>
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center;">
                        <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">1</div>
                        <span style="color: #0c4a6e; font-weight: 500;">We'll confirm your pickup time within 24 hours</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">2</div>
                        <span style="color: #0c4a6e; font-weight: 500;">Our professional team collects your items</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">3</div>
                        <span style="color: #0c4a6e; font-weight: 500;">Expert cleaning with premium care</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">4</div>
                        <span style="color: #0c4a6e; font-weight: 500;">Fresh, clean delivery to your door</span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/track/${orderNumber}" 
                   style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                    📱 Track Your Order
                </a>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Questions? We're here to help!</p>
                <p style="margin: 0; color: #16a34a; font-weight: 600;">📧 ${
                  process.env.EMAIL_FROM
                }</p>
            </div>
        </div>
        
        <div style="background: #1f2937; color: #d1d5db; padding: 25px 30px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Thank you for choosing our premium laundry service! 🌟</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">© 2024 Premium Laundry Service. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateBusinessNotificationHTML(customerName, orderNumber, orderDetails) {
    const {
      name,
      customerInfo,
      pickupInfo,
      deliveryInfo,
      cartItems,
      totalAmount,
      paymentMethod,
    } = orderDetails;

    const itemsHTML = cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.category
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(
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
    <meta charset="utf-8">
    <title>New Order Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🚨 NEW ORDER RECEIVED</h1>
            <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
            <h2>Customer Information</h2>
            <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626;">
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerInfo?.email || "N/A"}</p>
                <p><strong>Phone:</strong> ${customerInfo?.phone || "N/A"}</p>
                <p><strong>Address:</strong> ${
                  customerInfo?.address || "N/A"
                }</p>
                ${
                  customerInfo?.city
                    ? `<p><strong>City:</strong> ${customerInfo.city}</p>`
                    : ""
                }
                ${
                  customerInfo?.zipCode
                    ? `<p><strong>Zip Code:</strong> ${customerInfo.zipCode}</p>`
                    : ""
                }
            </div>
            
            <h2>Order Details</h2>
            <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626;">
                <div style="display:flex; flex-direction:row; gap:20px ">
                <p><strong>Pickup Date:</strong> ${new Date(
                  orderDetails.pickupInfo.date
                ).toLocaleDateString()}</p>
                <p style="padding-left:20px"><strong>Pickup Time:</strong> ${
                  orderDetails.pickupInfo.time
                }</p>
                </div>
                

                ${
                  orderDetails.deliveryInfo.date
                    ? `<div style="display:flex; flex-direction:row;gap:20px"><p ><strong>Delivery Date:</strong> ${new Date(
                        orderDetails.deliveryInfo.date
                      ).toLocaleDateString()}</p><p style="padding-left:20px" ><strong>Delivery Time:</strong> ${
                        orderDetails.deliveryInfo.time
                      }</p></div>`
                    : ""
                }
                <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
            </div>
            
            <h3>Items:</h3>
            <table style="width: 100%; border-collapse: collapse; background: white;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            ${
              orderDetails.pickupInfo.instructions
                ? `
            <div style="background: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4 style="margin-top: 0;">Special Instructions:</h4>
                <p>${orderDetails.pickupInfo.instructions}</p>
            </div>
            `
                : ""
            }
            
            <div style="background: #dc2626; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <h3 style="margin: 0;">⚡ ACTION REQUIRED</h3>
                <p style="margin: 10px 0 0 0;">Please confirm pickup time and process this order</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateOrderConfirmationHTML(customerName, orderNumber, orderDetails) {
    // ... (this entire HTML template function is unchanged)
    const {
      service,
      pickupDate,
      deliveryDate,
      totalAmount,
      items,
      specialInstructions,
    } = orderDetails;

    const itemsHTML = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          item.category
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">AED${(
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
    <meta charset="utf-8">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Order Confirmation</h1>
            <p style="margin: 10px 0 0 0;">Thank you for choosing our laundry service!</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
            <h2>Hello ${customerName},</h2>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Pickup Date:</strong> ${new Date(
                  pickupDate
                ).toLocaleDateString()}</p>
                ${
                  deliveryDate
                    ? `<p><strong>Delivery Date:</strong> ${new Date(
                        deliveryDate
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                <p><strong>Total Amount:</strong> AED${totalAmount.toFixed(
                  2
                )}</p>
            </div>
            
            <h3>Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse; background: white;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            ${
              specialInstructions
                ? `
            <div style="background: white; padding: 15px; margin: 20px 0;">
                <h4>Special Instructions:</h4>
                <p>${specialInstructions}</p>
            </div>
            `
                : ""
            }
            
            <div style="background: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4 style="margin-top: 0;">What's Next?</h4>
                <ol>
                    <li>We'll confirm your pickup time within 24 hours</li>
                    <li>Our team will collect your items on the scheduled date</li>
                    <li>You'll receive updates as your order progresses</li>
                    <li>Track your order anytime using the link below</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/track/${orderNumber}" 
                   style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Track Your Order
                </a>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at ${
              process.env.EMAIL_FROM
            }</p>
            
            <p>Best regards,<br>The Laundry Service Team</p>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 Laundry Service. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
